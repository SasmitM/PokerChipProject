// src/sockets/socketHandlers.ts
import { Server, Socket } from "socket.io";
import { getPlayerById, setPlayerInactive } from "../services/playerService.js";

// Store socket-to-player mappings
const socketToPlayer = new Map<string, { playerId: string; tableId: string }>();

export function initializeSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("New WebSocket connection:", socket.id);

    // Player joins a table
    socket.on("join-table", async (data: { tableId: string; playerId: string }) => {
      try {
        const { tableId, playerId } = data;
        
        // Verify player exists
        const player = await getPlayerById(playerId);
        if (!player) {
          socket.emit("error", { message: "Player not found" });
          return;
        }

        // Store the mapping
        socketToPlayer.set(socket.id, { playerId, tableId });
        
        // Join the table room
        socket.join(tableId);
        
        // Notify others in the room
        socket.to(tableId).emit("player-joined", {
          playerId,
          playerName: player.name,
          chips: player.money_count
        });

        console.log(`Player ${player.name} joined table ${tableId}`);
      } catch (error) {
        console.error("Error joining table:", error);
        socket.emit("error", { message: "Failed to join table" });
      }
    });

    // Player leaves table
    socket.on("leave-table", async () => {
      const playerInfo = socketToPlayer.get(socket.id);
      if (!playerInfo) return;

      const { playerId, tableId } = playerInfo;
      
      try {
        // Get player info before marking inactive
        const player = await getPlayerById(playerId);
        if (player) {
          // Mark player as inactive
          await setPlayerInactive(playerId);
          
          // Leave the room
          socket.leave(tableId);
          
          // Notify others
          socket.to(tableId).emit("player-left", {
            playerId,
            playerName: player.name
          });
        }
        
        // Clean up mapping
        socketToPlayer.delete(socket.id);
      } catch (error) {
        console.error("Error leaving table:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("WebSocket disconnected:", socket.id);
      
      const playerInfo = socketToPlayer.get(socket.id);
      if (playerInfo) {
        const { playerId, tableId } = playerInfo;
        
        try {
          const player = await getPlayerById(playerId);
          if (player) {
            await setPlayerInactive(playerId);
            
            // Notify others in the room
            io.to(tableId).emit("player-disconnected", {
              playerId,
              playerName: player.name
            });
          }
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }
        
        socketToPlayer.delete(socket.id);
      }
    });
  });
}