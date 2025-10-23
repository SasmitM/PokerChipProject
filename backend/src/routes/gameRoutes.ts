import { Router } from 'express';
import { 
  addToPot, 
  takeFromPot, 
  resetPot, 
  getTableById 
} from '../services/tableService.js';
import { updatePlayerChips, getPlayerById } from '../services/playerService.js';
import { logActivity, getTableActivities } from '../services/activityService.js';

const router = Router();

// Place bet
router.post('/tables/:tableId/bet', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { playerId, amount } = req.body;

    if (!playerId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid playerId and amount required' });
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (player.money_count < amount) {
      return res.status(400).json({ error: 'Insufficient chips' });
    }

    // Update player chips
    await updatePlayerChips(playerId, player.money_count - amount);

    // Add to pot
    const table = await addToPot(tableId, amount);

    // Log activity
    await logActivity({
      table_id: tableId,
      player_id: playerId,
      action_type: 'bet',
      amount
    });

    res.json({
      message: 'Bet placed successfully',
      newPot: table.current_pot,
      playerChips: player.money_count - amount
    });
  } catch (error: any) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: error.message || 'Failed to place bet' });
  }
});

// Take from pot
router.post('/tables/:tableId/take', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { playerId, amount } = req.body;

    if (!playerId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid playerId and amount required' });
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Take from pot
    const table = await takeFromPot(tableId, amount);

    // Update player chips
    await updatePlayerChips(playerId, player.money_count + amount);

    // Log activity
    await logActivity({
      table_id: tableId,
      player_id: playerId,
      action_type: 'take',
      amount
    });

    res.json({
      message: 'Took from pot successfully',
      newPot: table.current_pot,
      playerChips: player.money_count + amount
    });
  } catch (error: any) {
    console.error('Error taking from pot:', error);
    res.status(500).json({ error: error.message || 'Failed to take from pot' });
  }
});

// Reset pot (creator only)
router.post('/tables/:tableId/reset-pot', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId required' });
    }

    const table = await getTableById(tableId);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (table.created_by !== playerId) {
      return res.status(403).json({ error: 'Only table creator can reset pot' });
    }

    await resetPot(tableId);

    await logActivity({
      table_id: tableId,
      player_id: playerId,
      action_type: 'reset_pot'
    });

    res.json({
      message: 'Pot reset successfully',
      newPot: 0
    });
  } catch (error: any) {
    console.error('Error resetting pot:', error);
    res.status(500).json({ error: 'Failed to reset pot' });
  }
});

// Admin: Edit player chips (creator only)
router.patch('/tables/:tableId/admin/player/:targetPlayerId/chips', async (req, res) => {
  try {
    const { tableId, targetPlayerId } = req.params;
    const { amount, adminPlayerId } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const table = await getTableById(tableId);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (table.created_by !== adminPlayerId) {
      return res.status(403).json({ error: 'Only table creator can edit chips' });
    }

    const updatedPlayer = await updatePlayerChips(targetPlayerId, amount);

    await logActivity({
      table_id: tableId,
      player_id: adminPlayerId,
      action_type: 'chips_edited',
      amount
    });

    res.json({
      message: 'Chips updated successfully',
      player: updatedPlayer
    });
  } catch (error: any) {
    console.error('Error updating chips:', error);
    res.status(500).json({ error: 'Failed to update chips' });
  }
});

// Get activity feed
router.get('/tables/:tableId/activities', async (req, res) => {
  try {
    const { tableId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const activities = await getTableActivities(tableId, limit);
    res.json(activities);
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;
