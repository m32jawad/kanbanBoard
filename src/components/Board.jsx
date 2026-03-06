import React, { useState } from "react";
import Column from "./Column.jsx";

export default function Board({
  board,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  onOpenCard,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const submitNewColumn = (event) => {
    event.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      return;
    }
    onAddColumn(trimmed);
    setNewTitle("");
    setIsAdding(false);
  };

  return (
    <main className="board">
      <section className="column-list">
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onUpdateColumn={onUpdateColumn}
            onDeleteColumn={onDeleteColumn}
            onAddCard={onAddCard}
            onUpdateCard={onUpdateCard}
            onDeleteCard={onDeleteCard}
            onMoveCard={onMoveCard}
            onOpenCard={onOpenCard}
          />
        ))}
        <div className="column add-column">
          {isAdding ? (
            <form onSubmit={submitNewColumn} className="inline-form">
              <input
                type="text"
                placeholder="Column name"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                autoFocus
              />
              <div className="inline-actions">
                <button className="btn primary" type="submit">
                  Add
                </button>
                <button className="btn ghost" type="button" onClick={() => setIsAdding(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button className="btn ghost" type="button" onClick={() => setIsAdding(true)}>
              + Column
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
