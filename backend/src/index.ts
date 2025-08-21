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

// Mount routes
app.use("/tables", tableRoutes);
app.use("/", playerRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));