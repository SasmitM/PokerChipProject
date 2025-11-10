import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import {Server} from "socket.io";
import {initializeSocket} from "./sockets/socketHandlers.js"
import tableRoutes from "./routes/tableRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();

const app = express();

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",  // Allow all origins for testing
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']  // Explicitly allow both transports
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api", playerRoutes);
app.use("/api", gameRoutes);
app.use("/api/tables", tableRoutes);

initializeSocket(io);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});


const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('WebSocket server ready for connections');
});