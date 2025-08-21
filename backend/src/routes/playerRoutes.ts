import { Router } from 'express';
import { 
  addPlayer, 
  getPlayersByTable, 
  rejoinWithSession,
  setPlayerInactive,
  updatePlayerChips,
  touchSession
} from '../services/playerService.js';

const router = Router();

//Test route
router.get('/player-test', (req, res) => {
  res.json({ message: 'Player routes are loaded!' });
});

// Join a table (create new player)
router.post('/tables/:tableId/players', async (req, res) => {
  console.log("Hit POST /tables/:tableId/players");
  console.log("Body:", req.body);
  try {
    const { tableId } = req.params;
    const { name, initialChips } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const result = await addPlayer(tableId, name, initialChips);
    
    res.status(201).json({
      message: 'Player joined successfully',
      player: result.player,
      sessionId: result.sessionId
    });
  } catch (error) {
    console.error('Error in POST /tables/:tableId/players:', error);
    res.status(500).json({ error: 'Failed to add player' });
  }
});

// Rejoin with session ID
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
  } catch (error) {
    console.error('Error in POST /sessions/:sessionId/rejoin:', error);
    res.status(404).json({ error: 'Session not found or expired' });
  }
});

// Get active players at a table
router.get('/tables/:tableId/players', async (req, res) => {
  try {
    const { tableId } = req.params;
    const players = await getPlayersByTable(tableId);
    res.json(players);
  } catch (error) {
    console.error('Error in GET /tables/:tableId/players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Leave table (mark inactive)
router.post('/players/:playerId/leave', async (req, res) => {
  try {
    const { playerId } = req.params;
    await setPlayerInactive(playerId);
    res.json({ message: 'Player left the table' });
  } catch (error) {
    console.error('Error in POST /players/:playerId/leave:', error);
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
  } catch (error) {
    console.error('Error in PATCH /players/:playerId/chips:', error);
    res.status(500).json({ error: 'Failed to update chips' });
  }
});

// Keep session alive (heartbeat)
router.post('/sessions/:sessionId/heartbeat', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await touchSession(sessionId);
    res.json({ message: 'Session updated' });
  } catch (error) {
    console.error('Error in POST /sessions/:sessionId/heartbeat:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

export default router;