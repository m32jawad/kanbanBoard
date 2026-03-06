import { isBoardValid } from "./boardStore.js";

const STORAGE_KEY = "kanban.board.v2";

export const loadBoard = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return isBoardValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveBoard = (board) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch {
    // Ignore write errors (storage full or disabled)
  }
};

