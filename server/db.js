import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function initDatabase(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS board (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  const existing = db.prepare("SELECT data FROM board WHERE id = 1").get();
  if (!existing) {
    const initialBoard = {
      version: 2,
      columns: [
        {
          id: crypto.randomUUID(),
          title: "Ideas",
          cards: [
            {
              id: crypto.randomUUID(),
              title: "Landing Page",
              description: "First sketches for hero and CTA",
              screenshots: [],
              accent: "hsl(200 64% 54%)",
              importance: null,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          title: "In Progress",
          cards: [],
        },
        {
          id: crypto.randomUUID(),
          title: "Done",
          cards: [],
        },
      ],
    };
    db.prepare("INSERT INTO board (id, data, updated_at) VALUES (1, ?, ?)").run(
      JSON.stringify(initialBoard),
      Date.now()
    );
  }

  return db;
}

export function getBoard(db) {
  const row = db.prepare("SELECT data FROM board WHERE id = 1").get();
  return row ? JSON.parse(row.data) : null;
}

export function saveBoard(db, boardData) {
  db.prepare("UPDATE board SET data = ?, updated_at = ? WHERE id = 1").run(
    JSON.stringify(boardData),
    Date.now()
  );
}

