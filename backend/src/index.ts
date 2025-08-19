// src/index.ts
import express from "express";
import tableRoutes from "./routes/tableRoutes";
import playerRoutes from "./routes/playerRoutes";

const app = express();
app.use(express.json());

app.use("/tables", tableRoutes);
app.use("/tables/:id/players", playerRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
