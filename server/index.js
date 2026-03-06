import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase, getBoard, saveBoard } from "./db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const dbPath = process.env.DATABASE_PATH || "./data/kanban.db";

const db = initDatabase(dbPath);

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "50mb" }));

// GET board
app.get("/api/board", (req, res) => {
  try {
    const board = getBoard(db);
    res.json(board);
  } catch (error) {
    console.error("GET /api/board error:", error);
    res.status(500).json({ error: "Failed to fetch board" });
  }
});

// PUT board
app.put("/api/board", (req, res) => {
  try {
    const boardData = req.body;
    saveBoard(db, boardData);
    res.json({ success: true });
  } catch (error) {
    console.error("PUT /api/board error:", error);
    res.status(500).json({ error: "Failed to save board" });
  }
});

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Kanban server running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${dbPath}`);
});

