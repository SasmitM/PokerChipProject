import { Router, Request, Response } from "express";
import { addPlayer, getPlayersByTable } from "../services/playerService";

const router = Router();

// Define the shape of route parameters
interface TableParams {
  id: string; // matches /tables/:id/players
}

// Create a new player in a table
router.post("/:id/players", async (req: Request<TableParams>, res: Response) => {
  const tableId = req.params.id;
  const { name } = req.body;

  try {
    const player = await addPlayer(tableId, name);
    res.json(player);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Supabase insert error:", err);
      res.status(500).json({ message: err.message });
    } else {
      console.error("Error adding player:", err);
      res.status(500).json({ message: "Unknown error" });
    }
  }
});

// Get all players for a table
router.get("/:id/players", async (req: Request<TableParams>, res: Response) => {
  const tableId = req.params.id;

  try {
    const players = await getPlayersByTable(tableId);
    res.json(players);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
});

export default router;
