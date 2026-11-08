import express from "express";
import cors from "cors";
import { prisma } from "./shared/db/connection";


const app = express(); 

// descomentar cuando tengamos el frontend corriendo en Vite
// app.use(cors({origin: "http://localhost:5173"})); // Vite local en 5173
// app.use(express.json());

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "OK", db: "connected" });
  } catch (error) {
    res.status(503).json({ status: "ERROR", db: "disconnected" });
  }
});

export default app;