// src/services/socketService.ts
import { io } from "../index.js";

export function emitBetPlaced(tableId: string, data: {
  playerId: string;
  playerName: string;
  amount: number;
  newPot: number;
  playerChips: number;
}) {
  io.to(tableId).emit("bet-placed", data);
}

export function emitChipsTaken(tableId: string, data: {
  playerId: string;
  playerName: string;
  amount: number;
  newPot: number;
  playerChips: number;
}) {
  io.to(tableId).emit("chips-taken", data);
}

export function emitPotReset(tableId: string, data: {
  playerId: string;
  playerName: string;
}) {
  io.to(tableId).emit("pot-reset", data);
}

export function emitChipsUpdated(tableId: string, data: {
  playerId: string;
  playerName: string;
  newAmount: number;
  adminName: string;
}) {
  io.to(tableId).emit("chips-updated", data);
}

export function emitActivityLog(tableId: string, activity: {
  playerName: string;
  action: string;
  amount?: number;
  timestamp: string;
}) {
  io.to(tableId).emit("activity", activity);
}