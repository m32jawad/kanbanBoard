import React, { useState } from "react";
import Card from "./Card.jsx";

export default function Column({
  column,
  columnIndex,
  isDragOver,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragEnd,
  onUpdateColumn,
  onDeleteColumn,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  onOpenCard,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(column.title);

  const submitTitle = (event) => {
    event.preventDefault();
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    onUpdateColumn(column.id, trimmed);
    setIsEditing(false);
  };


  // Card drag-over / drop
  const handleCardDragOver = (event) => {
    event.preventDefault();
  };

  const handleCardDrop = (event) => {
    event.preventDefault();
    try {
      const payload = JSON.parse(event.dataTransfer.getData("application/json"));
      if (payload?.cardId && payload?.fromColumnId) {
        onMoveCard(payload.fromColumnId, column.id, payload.cardId);
      }
    } catch {
      // Ignore invalid drag data
    }
  };

  // Column drag
  const handleColDragStart = (event) => {
    // Don't start column drag when dragging a card
    event.dataTransfer.effectAllowed = "move";
    // Small timeout so the drag image is rendered before we set state
    setTimeout(() => onColumnDragStart(columnIndex), 0);
  };

  return (
    <section
      className={`column${isDragOver ? " column-drag-over" : ""}`}
      draggable
      onDragStart={handleColDragStart}
      onDragOver={(e) => onColumnDragOver(e, columnIndex)}
      onDrop={(e) => {
        // Card drops: handled by card-list; column drops: handled here
        const raw = e.dataTransfer.getData("application/json");
        if (raw) {
          handleCardDrop(e);
        } else {
          onColumnDrop(e, columnIndex);
        }
      }}
      onDragEnd={onColumnDragEnd}
    >
      <header className="column-header">
        <div className="column-drag-handle" title="Drag to reorder">⠿</div>
        {isEditing ? (
          <form onSubmit={submitTitle} className="inline-form">
            <input
              type="text"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              autoFocus
            />
          </form>
        ) : (
          <div className="column-title">
            <h2>{column.title}</h2>
            <span className="badge">{column.cards.length}</span>
          </div>
        )}
        <div className="column-actions">
          {isEditing ? (
            <button className="btn ghost" type="button" onClick={() => setIsEditing(false)}>Done</button>
          ) : (
            <button className="btn ghost" type="button" onClick={() => setIsEditing(true)}>Edit</button>
          )}
          <button className="btn ghost" type="button" onClick={() => onDeleteColumn(column.id)}>Delete</button>
        </div>
      </header>
      <div className="card-list" onDragOver={handleCardDragOver} onDrop={handleCardDrop}>
        {column.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
            onOpen={() => onOpenCard(card.id)}
            onDelete={() => onDeleteCard(column.id, card.id)}
            onUpdate={(payload) => onUpdateCard(column.id, card.id, payload)}
          />
        ))}
      </div>
      <button className="btn ghost" type="button" onClick={() => onAddCard(column.id)}>
        + Card
      </button>
    </section>
  );
}
