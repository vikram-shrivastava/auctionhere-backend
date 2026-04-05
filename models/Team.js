import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  purseRemaining: { type: Number, default: 1200000000 }, // 120 Crores in Rupees
  playersBought: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
}, { timestamps: true });

export default mongoose.models.Team || mongoose.model('Team', teamSchema);