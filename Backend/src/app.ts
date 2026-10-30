import express from "express";
import cors from "cors";

const app = express(); 

// descomentar cuando tengamos el frontend corriendo en Vite
// app.use(cors({origin: "http://localhost:5173"})); // Vite local en 5173
// app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => { 
  res.json({ status: "OK" });
});

export default app;