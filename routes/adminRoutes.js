import express from 'express';
import { 
  getAllPlayers, 
  createPlayer, 
  updatePlayer, 
  deletePlayer 
} from '../controllers/adminController.js';

const router = express.Router();

router.route('/players')
  .get(getAllPlayers)
  .post(createPlayer);

router.route('/players/:id')
  .put(updatePlayer)
  .delete(deletePlayer);

export default router;