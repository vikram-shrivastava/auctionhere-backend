import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/Player.js'; 

dotenv.config(); 

const players = [
  // ==========================================
  // 1. CAPPED BATSMEN
  // ==========================================
  { name: 'Virat Kohli', role: 'Batsman', isCapped: true, basePrice: 20000000, auctionOrder: 1 },
  { name: 'Rohit Sharma', role: 'Batsman', isCapped: true, basePrice: 20000000, auctionOrder: 2 },
  { name: 'Suryakumar Yadav', role: 'Batsman', isCapped: true, basePrice: 20000000, auctionOrder: 3 },
  { name: 'Shubman Gill', role: 'Batsman', isCapped: true, basePrice: 20000000, auctionOrder: 4 },
  { name: 'Shreyas Iyer', role: 'Batsman', isCapped: true, basePrice: 20000000, auctionOrder: 5 },
  { name: 'Ruturaj Gaikwad', role: 'Batsman', isCapped: true, basePrice: 20000000, auctionOrder: 6 },
  { name: 'Travis Head', role: 'Batsman', isCapped: true, basePrice: 20000000, auctionOrder: 7 },
  { name: 'Sai Sudharsan', role: 'Batsman', isCapped: true, basePrice: 10000000, auctionOrder: 8 },
  { name: 'Devdutt Padikkal', role: 'Batsman', isCapped: true, basePrice: 10000000, auctionOrder: 9 },

  // ==========================================
  // 2. CAPPED BOWLERS
  // ==========================================
  { name: 'Jasprit Bumrah', role: 'Bowler', isCapped: true, basePrice: 20000000, auctionOrder: 10 },
  { name: 'Mohammed Shami', role: 'Bowler', isCapped: true, basePrice: 20000000, auctionOrder: 11 },
  { name: 'Rashid Khan', role: 'Bowler', isCapped: true, basePrice: 20000000, auctionOrder: 12 },
  { name: 'Pat Cummins', role: 'Bowler', isCapped: true, basePrice: 20000000, auctionOrder: 13 },
  { name: 'Mitchell Starc', role: 'Bowler', isCapped: true, basePrice: 20000000, auctionOrder: 14 },
  { name: 'Kagiso Rabada', role: 'Bowler', isCapped: true, basePrice: 20000000, auctionOrder: 15 },
  { name: 'Arshdeep Singh', role: 'Bowler', isCapped: true, basePrice: 10000000, auctionOrder: 16 },
  { name: 'Mohammed Siraj', role: 'Bowler', isCapped: true, basePrice: 10000000, auctionOrder: 17 },
  { name: 'Kuldeep Yadav', role: 'Bowler', isCapped: true, basePrice: 10000000, auctionOrder: 18 },
  { name: 'Yuzvendra Chahal', role: 'Bowler', isCapped: true, basePrice: 10000000, auctionOrder: 19 },

  // ==========================================
  // 3. CAPPED ALLROUNDERS
  // ==========================================
  { name: 'Ravindra Jadeja', role: 'Allrounder', isCapped: true, basePrice: 20000000, auctionOrder: 20 },
  { name: 'Hardik Pandya', role: 'Allrounder', isCapped: true, basePrice: 20000000, auctionOrder: 21 },
  { name: 'Andre Russell', role: 'Allrounder', isCapped: true, basePrice: 20000000, auctionOrder: 22 },
  { name: 'Glenn Maxwell', role: 'Allrounder', isCapped: true, basePrice: 20000000, auctionOrder: 23 },
  { name: 'Sunil Narine', role: 'Allrounder', isCapped: true, basePrice: 20000000, auctionOrder: 24 },
  { name: 'Sam Curran', role: 'Allrounder', isCapped: true, basePrice: 20000000, auctionOrder: 25 },
  { name: 'Axar Patel', role: 'Allrounder', isCapped: true, basePrice: 20000000, auctionOrder: 26 },
  { name: 'Shivam Dube', role: 'Allrounder', isCapped: true, basePrice: 10000000, auctionOrder: 27 },
  { name: 'Washington Sundar', role: 'Allrounder', isCapped: true, basePrice: 10000000, auctionOrder: 28 },

  // ==========================================
  // 4. CAPPED WICKETKEEPERS
  // ==========================================
  { name: 'Rishabh Pant', role: 'Wicketkeeper', isCapped: true, basePrice: 20000000, auctionOrder: 29 },
  { name: 'KL Rahul', role: 'Wicketkeeper', isCapped: true, basePrice: 20000000, auctionOrder: 30 },
  { name: 'Sanju Samson', role: 'Wicketkeeper', isCapped: true, basePrice: 20000000, auctionOrder: 31 },
  { name: 'Jos Buttler', role: 'Wicketkeeper', isCapped: true, basePrice: 20000000, auctionOrder: 32 },
  { name: 'Nicholas Pooran', role: 'Wicketkeeper', isCapped: true, basePrice: 20000000, auctionOrder: 33 },
  { name: 'Heinrich Klaasen', role: 'Wicketkeeper', isCapped: true, basePrice: 20000000, auctionOrder: 34 },
  { name: 'Ishan Kishan', role: 'Wicketkeeper', isCapped: true, basePrice: 10000000, auctionOrder: 35 },

  // ==========================================
  // 5. UNCAPPED BATSMEN
  // ==========================================
  { name: 'Ashutosh Sharma', role: 'Batsman', isCapped: false, basePrice: 2500000, auctionOrder: 36 },
  { name: 'Shashank Singh', role: 'Batsman', isCapped: false, basePrice: 2500000, auctionOrder: 37 },
  { name: 'Nehal Wadhera', role: 'Batsman', isCapped: false, basePrice: 2500000, auctionOrder: 38 },
  { name: 'Abhinav Manohar', role: 'Batsman', isCapped: false, basePrice: 2500000, auctionOrder: 39 },

  // ==========================================
  // 6. UNCAPPED BOWLERS
  // ==========================================
  { name: 'Mayank Yadav', role: 'Bowler', isCapped: false, basePrice: 2500000, auctionOrder: 40 },
  { name: 'Harshit Rana', role: 'Bowler', isCapped: false, basePrice: 2500000, auctionOrder: 41 },
  { name: 'Yash Thakur', role: 'Bowler', isCapped: false, basePrice: 2500000, auctionOrder: 42 },
  { name: 'Mohsin Khan', role: 'Bowler', isCapped: false, basePrice: 2500000, auctionOrder: 43 },

  // ==========================================
  // 7. UNCAPPED ALLROUNDERS
  // ==========================================
  { name: 'Nitesh Kumar Reddy', role: 'Allrounder', isCapped: false, basePrice: 2500000, auctionOrder: 44 },
  { name: 'Ramandeep Singh', role: 'Allrounder', isCapped: false, basePrice: 2500000, auctionOrder: 45 },
  { name: 'Mahipal Lomror', role: 'Allrounder', isCapped: false, basePrice: 2500000, auctionOrder: 46 },
  { name: 'Abdul Samad', role: 'Allrounder', isCapped: false, basePrice: 2500000, auctionOrder: 47 },

  // ==========================================
  // 8. UNCAPPED WICKETKEEPERS
  // ==========================================
  { name: 'Prabhsimran Singh', role: 'Wicketkeeper', isCapped: false, basePrice: 2500000, auctionOrder: 48 },
  { name: 'Robin Minz', role: 'Wicketkeeper', isCapped: false, basePrice: 2500000, auctionOrder: 49 },
  { name: 'Kumar Kushagra', role: 'Wicketkeeper', isCapped: false, basePrice: 2500000, auctionOrder: 50 },
];

async function seedDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB...');

    await Player.deleteMany({}); 
    console.log('🗑️ Cleared existing players...');

    await Player.insertMany(players);
    console.log(`🎉 Successfully seeded ${players.length} IPL players across 8 categories!`);

    mongoose.disconnect();
    console.log('🔌 Disconnected from DB.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();