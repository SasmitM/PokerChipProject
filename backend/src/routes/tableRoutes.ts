import express from "express";
import { createTable, getTableById, updateTableCreator } from "../services/tableService.js";
import { addPlayer } from "../services/playerService.js";
import { logActivity } from "../services/activityService.js";

const router = express.Router();

// Create table and join as first player
router.post("/", async (req, res) => {
  try {
    const { tableName, playerName, initialChips = 1000 } = req.body;

    if (!tableName || !playerName) {
      return res.status(400).json({ error: 'Table name and player name required' });
    }

    // Create table
    const table = await createTable(tableName);

    // Add creator as first player
    const { player, sessionId } = await addPlayer(table.id, playerName, initialChips);

    // Update table with creator
    await updateTableCreator(table.id, player.id);

    // Log join activity
    await logActivity({
      table_id: table.id,
      player_id: player.id,
      action_type: 'joined'
    });

    res.status(201).json({
      table: { ...table, created_by: player.id },
      player,
      sessionId,
      message: 'Table created and joined successfully'
    });
  } catch (err: any) {
    console.error("Error creating table:", err);
    res.status(500).json({ error: err.message || "Failed to create table" });
  }
});

// Get table details
router.get("/:id", async (req, res) => {
  try {
    const table = await getTableById(req.params.id);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }
    res.json(table);
  } catch (err: any) {
    console.error("Error fetching table:", err);
    res.status(500).json({ error: "Failed to fetch table" });
  }
});

export default router;
