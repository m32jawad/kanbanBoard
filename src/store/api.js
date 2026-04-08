const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
import { loadBoard as loadLocalBoard, saveBoard as saveLocalBoard } from "./storage.js";

export const loadBoard = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/board`);
    if (!res.ok) throw new Error("Failed to load board");
    const board = await res.json();
    // Keep a local snapshot so refresh still works if API is down later.
    saveLocalBoard(board);
    return board;
  } catch (error) {
    console.error("loadBoard error:", error);
    return loadLocalBoard();
  }
};

export const saveBoard = async (board) => {
  // Always persist locally first for offline / backend-down resilience.
  saveLocalBoard(board);
  try {
    const res = await fetch(`${API_BASE}/api/board`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(board),
    });
    if (!res.ok) throw new Error("Failed to save board");
  } catch (error) {
    console.error("saveBoard error:", error);
  }
};

