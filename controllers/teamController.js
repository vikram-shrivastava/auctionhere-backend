import Team from '../models/Team.js';

// GET /api/teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({});
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

// POST /api/teams
export const createTeam = async (req, res) => {
  try {
    const { teamName, ownerName } = req.body;
    
    // Check if team name already exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res.status(400).json({ error: 'Team name already exists. Choose a unique name.' });
    }

    const newTeam = await Team.create({ teamName, ownerName });
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create team', details: error.message });
  }
};

// GET /api/teams/:id
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('playersBought'); // Brings in the full player data, not just IDs
      
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};