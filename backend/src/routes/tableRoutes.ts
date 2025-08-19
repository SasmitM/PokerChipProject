// src/routes/tableRoutes.ts
import express from "express";
import { createTable, getTableById } from "../services/tableService";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const table = await createTable(name);
    res.status(201).json(table);
  } catch (err: unknown) {
  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Unknown error" });
  }
}

});

router.get("/:id", async (req, res) => {
  try {
    const table = await getTableById(req.params.id);
    if (!table) return res.status(404).json({ error: "Table not found" });
    res.json(table);
  } catch (err: unknown) {
  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Unknown error" });
  }
}

});

export default router;
