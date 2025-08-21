import express from "express";
import { createTable, getTableById } from "../services/tableService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Hit POST /tables route");
  console.log("Body:", req.body);
  try {
    const { name } = req.body;
    const table = await createTable(name);
    res.status(201).json(table);
  } catch (err: unknown) {
    console.error("Actual error:", err);
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
});

router.get("/:id", async (req, res) => {
  console.log("Hit GET /tables/:id route");
  try {
    const table = await getTableById(req.params.id);
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (err: unknown) {
    console.error("Actual error:", err);
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
});

export default router;