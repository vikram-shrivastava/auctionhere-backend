import Bid from '../models/Bid.js';

// GET /api/bids/:playerId
export const getPlayerBids = async (req, res) => {
  try {
    const bids = await Bid.find({ player: req.params.playerId })
      .populate('team', 'teamName') // Bring in the team name
      .sort({ timestamp: -1 }); // Newest bids first

    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bid history' });
  }
};