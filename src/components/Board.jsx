import React, { useState, useRef } from "react";
import Column from "./Column.jsx";

export default function Board({
  board,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onMoveColumn,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  onOpenCard,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const dragColIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const submitNewColumn = (event) => {
    event.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAddColumn(trimmed);
    setNewTitle("");
    setIsAdding(false);
  };

  const handleColumnDragStart = (index) => {
    dragColIndex.current = index;
  };

  const handleColumnDragOver = (event, index) => {
    event.preventDefault();
    setDragOverIndex(index);
  };

  const handleColumnDrop = (event, toIndex) => {
    event.preventDefault();
    // Only handle column drops (not card drops — those carry application/json)
    const raw = event.dataTransfer.getData("application/json");
    if (raw) return; // card drop – let Column handle it
    if (dragColIndex.current !== null && dragColIndex.current !== toIndex) {
      onMoveColumn(dragColIndex.current, toIndex);
    }
    dragColIndex.current = null;
    setDragOverIndex(null);
  };

  const handleColumnDragEnd = () => {
    dragColIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <main className="board">
      <section className="column-list">
        {board.columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            columnIndex={index}
            isDragOver={dragOverIndex === index}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            onColumnDragEnd={handleColumnDragEnd}
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
                <button className="btn primary" type="submit">Add</button>
                <button className="btn ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</button>
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
