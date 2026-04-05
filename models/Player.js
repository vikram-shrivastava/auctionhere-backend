import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Batsman', 'Bowler', 'Allrounder', 'Wicketkeeper'], 
    required: true 
  },
  isCapped: { type: Boolean, required: true }, // true = International, false = Uncapped
  basePrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'unsold', 'sold'], 
    default: 'upcoming' 
  },
  soldPrice: { type: Number, default: 0 },
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  auctionOrder: { type: Number, required: true } // Determines who comes first
}, { timestamps: true });

export default mongoose.models.Player || mongoose.model('Player', playerSchema);