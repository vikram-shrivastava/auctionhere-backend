import express from 'express';
import { getPlayerBids } from '../controllers/bidController.js';

const router = express.Router();
router.route('/:playerId').get(getPlayerBids);

export default router;