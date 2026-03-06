const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const loadBoard = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/board`);
    if (!res.ok) throw new Error("Failed to load board");
    return await res.json();
  } catch (error) {
    console.error("loadBoard error:", error);
    return null;
  }
};

export const saveBoard = async (board) => {
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

