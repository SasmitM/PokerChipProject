import { Router } from 'express';
import { 
  addPlayer, 
  getPlayersByTable, 
  rejoinWithSession,
  setPlayerInactive,
  updatePlayerChips,
  touchSession,
  getPlayerById
} from '../services/playerService.js';
import { logActivity } from '../services/activityService.js';

const router = Router();

// Join a table
router.post('/tables/:tableId/players', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { name, initialChips = 1000 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const result = await addPlayer(tableId, name, initialChips);
    
    // Log activity
    await logActivity({
      table_id: tableId,
      player_id: result.player.id,
      action_type: 'joined'
    });
    
    res.status(201).json({
      message: 'Player joined successfully',
      player: result.player,
      sessionId: result.sessionId
    });
  } catch (error: any) {
    console.error('Error joining table:', error);
    res.status(500).json({ error: error.message || 'Failed to join table' });
  }
});

// Get active players
router.get('/tables/:tableId/players', async (req, res) => {
  try {
    const { tableId } = req.params;
    const players = await getPlayersByTable(tableId);
    res.json(players);
  } catch (error: any) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Rejoin with session
router.post('/sessions/:sessionId/rejoin', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await rejoinWithSession(sessionId);
    
    res.json({
      message: 'Rejoined successfully',
      player: result.player,
      sessionId: result.sessionId,
      tableId: result.tableId
    });
  } catch (error: any) {
    console.error('Error rejoining:', error);
    res.status(404).json({ error: error.message || 'Session not found' });
  }
});

// Leave table
router.post('/players/:playerId/leave', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // Get player info for logging
    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    await setPlayerInactive(playerId);
    
    // Log activity
    await logActivity({
      table_id: player.table_id,
      player_id: playerId,
      action_type: 'left'
    });
    
    res.json({ message: 'Player left the table' });
  } catch (error: any) {
    console.error('Error leaving table:', error);
    res.status(500).json({ error: 'Failed to leave table' });
  }
});

// Update chips
router.patch('/players/:playerId/chips', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Valid chip amount required' });
    }

    const player = await updatePlayerChips(playerId, amount);
    res.json(player);
  } catch (error: any) {
    console.error('Error updating chips:', error);
    res.status(500).json({ error: 'Failed to update chips' });
  }
});

// Heartbeat
router.post('/sessions/:sessionId/heartbeat', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await touchSession(sessionId);
    res.json({ message: 'Session updated' });
  } catch (error: any) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

export default router;