import express from "express";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { createTable } from "./services/tableService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Poker Backend Running!</h1>");
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// WebSocket setup
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("A client connected");

  ws.on("message", async (message) => {
    const msg = JSON.parse(message.toString());

    if (msg.type === "create_table") {
      try {
        const table = await createTable(msg.name || "Random Table");
        ws.send(JSON.stringify({ type: "table_created", table }));
     }catch (err: any) {
        ws.send(JSON.stringify({ type: "error", error: err.message }));
     }
    }
  });

  ws.on("close", () => {
    console.log("A client disconnected");
  });
});
