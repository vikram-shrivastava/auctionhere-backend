import Player from '../models/Player.js';

// GET /api/admin/players
// controllers/adminController.js

export const getAllPlayers = async (req, res) => {
  try {
    // Define the custom order for roles
    const roleOrder = ["Batsman", "Bowler", "Allrounder", "Wicketkeeper"];

    const players = await Player.find({});

    // Manual sort to handle the complex category + status logic
    const sortedPlayers = players.sort((a, b) => {
      // 1. Sort by Status (Upcoming > Unsold > Sold)
      const statusMap = { upcoming: 0, unsold: 1, sold: 2 };
      if (statusMap[a.status] !== statusMap[b.status]) {
        return statusMap[a.status] - statusMap[b.status];
      }

      // 2. Sort by Capped Status (Capped > Uncapped)
      if (a.isCapped !== b.isCapped) {
        return a.isCapped ? -1 : 1;
      }

      // 3. Sort by Role Order
      if (a.role !== b.role) {
        return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
      }

      // 4. Finally by their original Auction Order
      return a.auctionOrder - b.auctionOrder;
    });

    res.status(200).json(sortedPlayers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};

// POST /api/admin/players
export const createPlayer = async (req, res) => {
  try {
    const newPlayer = await Player.create(req.body);
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create player', details: error.message });
  }
};

// PUT /api/admin/players/:id
export const updatePlayer = async (req, res) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedPlayer) return res.status(404).json({ error: 'Player not found' });
    res.status(200).json(updatedPlayer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update player', details: error.message });
  }
};

// DELETE /api/admin/players/:id
export const deletePlayer = async (req, res) => {
  try {
    const deletedPlayer = await Player.findByIdAndDelete(req.params.id);
    if (!deletedPlayer) return res.status(404).json({ error: 'Player not found' });
    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
};