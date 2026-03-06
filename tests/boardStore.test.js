import { describe, expect, it } from "vitest";
import {
  createInitialBoard,
  addColumn,
  updateColumn,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
} from "../src/store/boardStore.js";

const firstColumnId = (board) => board.columns[0].id;

describe("boardStore", () => {
  it("creates a board with columns", () => {
    const board = createInitialBoard();
    expect(board.columns.length).toBeGreaterThan(0);
  });

  it("adds, updates, and deletes a column", () => {
    const board = createInitialBoard();
    const added = addColumn(board, "Backlog");
    const newColumnId = added.columns[added.columns.length - 1].id;

    const updated = updateColumn(added, newColumnId, "Neu");
    expect(updated.columns.find((c) => c.id === newColumnId).title).toBe("Neu");

    const removed = deleteColumn(updated, newColumnId);
    expect(removed.columns.find((c) => c.id === newColumnId)).toBeUndefined();
  });

  it("adds, updates, and deletes a card", () => {
    const board = createInitialBoard();
    const columnId = firstColumnId(board);
    const withCard = addCard(board, columnId, "Task A");
    const cardId = withCard.columns[0].cards[withCard.columns[0].cards.length - 1].id;

    const updated = updateCard(withCard, columnId, cardId, { title: "Task B" });
    expect(updated.columns[0].cards.find((c) => c.id === cardId).title).toBe("Task B");

    const removed = deleteCard(updated, columnId, cardId);
    expect(removed.columns[0].cards.find((c) => c.id === cardId)).toBeUndefined();
  });
});

