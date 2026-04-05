import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import Player from './models/Player.js';
import Team from './models/Team.js';
import Bid from './models/Bid.js';

import adminRoutes from './routes/adminRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- AUCTION STATE VARIABLES ---
let activePlayer = null;
let highestBid = 0;
let highestBidder = null; 
let highestBidderName = ""; 
let auctionTimer = null;
let isProcessingBid = false;

// Pause/Resume Timer logic
let activePlayerTimeLeft = 20000; 
let timerStartTimestamp = 0;      

const TIMEOUT_MS = 60000; 
const PROCESSING_DELAY_MS = 2000; 

// --- NEW: WITHDRAWAL & CONNECTION TRACKING ---
const connectedTeams = new Map(); // Tracks socket.id -> teamId
let withdrawnTeams = new Set();   // Tracks teamIds that have passed on the current player

async function broadcastLobbyStats(socketTarget = io.to('auction-room')) {
  try {
    const remainingPlayers = await Player.countDocuments({ status: { $in: ['upcoming', 'unsold'] } });
    socketTarget.emit('lobby-stats', { remainingPlayers });
  } catch (err) {
    console.error("Error fetching lobby stats:", err);
  }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Join the Auction Room
  socket.on('join-room', async ({ teamId }) => {
    socket.join('auction-room');
    
    // TRACK CONNECTION
    if (teamId) {
      connectedTeams.set(socket.id, teamId);
      try {
        const team = await Team.findById(teamId);
        if (team) {
          socket.emit('team-sync', { purseRemaining: team.purseRemaining });
        }
      } catch (err) {
        console.error("Error syncing team:", err);
      }
    }

    await broadcastLobbyStats(socket);
    
    if (activePlayer) {
      const timeRemaining = isProcessingBid 
        ? activePlayerTimeLeft 
        : activePlayerTimeLeft - (Date.now() - timerStartTimestamp);

      socket.emit('auction-state', {
        player: activePlayer,
        highestBid,
        highestBidderName,
        timeLeft: Math.max(0, timeRemaining)
      });
    }
  });

  // 2. Admin Starts a Player's Auction
  socket.on('admin-start-player', async ({ playerId }) => {
    try {
      const player = await Player.findById(playerId);
      if (!player) return;

      activePlayer = player;
      highestBid = player.basePrice;
      highestBidder = null;
      highestBidderName = "";
      isProcessingBid = false;
      
      // RESET WITHDRAWALS FOR NEW PLAYER
      withdrawnTeams.clear();

      activePlayerTimeLeft = TIMEOUT_MS;
      timerStartTimestamp = Date.now();

      io.to('auction-room').emit('new-player-on-block', {
        player: activePlayer,
        currentBid: highestBid,
        timeLeft: activePlayerTimeLeft 
      });

      startAuctionTimer(activePlayerTimeLeft);
    } catch (error) {
      console.error(error);
    }
  });

  // 3. Handle incoming bids
  socket.on('place-bid', async ({ teamId, bidAmount }) => {
    if (!activePlayer) return socket.emit('bid-error', 'No active player.');
    if (isProcessingBid) return socket.emit('bid-error', 'Processing previous bid, please wait...');
    if (bidAmount <= highestBid && highestBidder !== null) return socket.emit('bid-error', 'Bid must be higher than the current bid.');

    try {
      const team = await Team.findById(teamId);
      if (!team) return socket.emit('bid-error', 'Team not found. Please log in again.');
      if (team.purseRemaining < bidAmount) return socket.emit('bid-error', 'Insufficient purse balance.');

      clearTimeout(auctionTimer);
      isProcessingBid = true;
      
      // If a team bids, they are actively participating, so ensure they aren't marked as withdrawn
      withdrawnTeams.delete(teamId);

      const elapsedSinceStart = Date.now() - timerStartTimestamp;
      activePlayerTimeLeft = Math.max(0, activePlayerTimeLeft - elapsedSinceStart);

      highestBid = bidAmount;
      highestBidder = team._id;
      highestBidderName = team.teamName;

      if (Bid) {
        await Bid.create({ player: activePlayer._id, team: team._id, amount: bidAmount });
      }

      io.to('auction-room').emit('bid-processing');

      setTimeout(() => {
        isProcessingBid = false; 
        timerStartTimestamp = Date.now(); 
        
        startAuctionTimer(activePlayerTimeLeft);

        io.to('auction-room').emit('bid-update', {
          currentBid: highestBid,
          highestBidderName,
          timeLeft: activePlayerTimeLeft 
        });

      }, PROCESSING_DELAY_MS);

    } catch (error) {
      console.error(error);
      socket.emit('bid-error', 'Server error processing bid.');
    }
  });

  // 4. NEW: Handle Team Withdrawal (Pass)
  socket.on('withdraw', ({ teamId }) => {
    if (!activePlayer || isProcessingBid) return;

    withdrawnTeams.add(teamId);

    // Calculate unique teams currently in the room
    const uniqueTeamsInRoom = new Set(connectedTeams.values()).size;

    // Logic to end early:
    // If there is a bid, we wait until EVERYONE EXCEPT the highest bidder withdraws (Total - 1)
    // If no bids yet, we wait until EVERYONE withdraws (Total)
    const requiredWithdrawals = highestBidder ? uniqueTeamsInRoom - 1 : uniqueTeamsInRoom;

    if (withdrawnTeams.size >= requiredWithdrawals && uniqueTeamsInRoom > 0) {
      console.log(`⏩ All active teams withdrew. Fast-forwarding auction for ${activePlayer.name}`);
      clearTimeout(auctionTimer);
      resolveAuction(); // Instantly sell to highest bidder or mark unsold
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    connectedTeams.delete(socket.id); // Remove from connected pool
  });
});

// --- HELPER FUNCTIONS ---

function startAuctionTimer(timeLeft) {
  auctionTimer = setTimeout(async () => {
    await resolveAuction();
  }, timeLeft);
}

async function resolveAuction() {
  if (!activePlayer) return;

  try {
    if (highestBidder) {
      activePlayer.status = 'sold';
      activePlayer.soldPrice = highestBid;
      activePlayer.soldTo = highestBidder;
      await activePlayer.save();

      const team = await Team.findById(highestBidder);
      team.purseRemaining -= highestBid;
      team.playersBought.push(activePlayer._id);
      await team.save();

      io.to('auction-room').emit('player-sold', {
        player: activePlayer,
        soldTo: team.teamName,
        soldToId: team._id, 
        price: highestBid,
        newPurse: team.purseRemaining 
      });

    } else {
      activePlayer.status = 'unsold';
      await activePlayer.save();

      io.to('auction-room').emit('player-unsold', {
        player: activePlayer
      });
    }

    activePlayer = null;
    highestBid = 0;
    highestBidder = null;
    highestBidderName = "";
    withdrawnTeams.clear(); // Reset withdrawals

    await broadcastLobbyStats();

  } catch (error) {
    console.error('Error resolving auction:', error);
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io Server running on port ${PORT}`);
});