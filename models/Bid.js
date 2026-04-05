import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Bid || mongoose.model('Bid', bidSchema);