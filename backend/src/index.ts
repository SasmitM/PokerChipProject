import express from "express";
import tableRoutes from "./routes/tableRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";

const app = express();
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Mount player routes first (they have more specific paths)
app.use(playerRoutes);

// Mount table routes last (they have more general paths)
app.use("/tables", tableRoutes);

// Add 404 handler to see what's not matching
app.use((req, res) => {
  console.log(`404 - No route matched for: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));