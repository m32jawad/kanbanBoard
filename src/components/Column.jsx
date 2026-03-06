import React, { useState } from "react";
import Card from "./Card.jsx";

export default function Column({
  column,
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
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

  const submitTitle = (event) => {
    event.preventDefault();
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      return;
    }
    onUpdateColumn(column.id, trimmed);
    setIsEditing(false);
  };

  const submitCard = (event) => {
    event.preventDefault();
    const trimmed = cardTitle.trim();
    if (!trimmed) {
      return;
    }
    onAddCard(column.id, trimmed);
    setCardTitle("");
    setIsAddingCard(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
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

  return (
    <section className="column" onDragOver={handleDragOver} onDrop={handleDrop}>
      <header className="column-header">
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
            <button className="btn ghost" type="button" onClick={() => setIsEditing(false)}>
              Done
            </button>
          ) : (
            <button className="btn ghost" type="button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
          <button className="btn ghost" type="button" onClick={() => onDeleteColumn(column.id)}>
            Delete
          </button>
        </div>
      </header>
      <div className="card-list">
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
      {isAddingCard ? (
        <form onSubmit={submitCard} className="inline-form">
          <input
            type="text"
            placeholder="Card title"
            value={cardTitle}
            onChange={(event) => setCardTitle(event.target.value)}
            autoFocus
          />
          <div className="inline-actions">
            <button className="btn primary" type="submit">
              Add card
            </button>
            <button className="btn ghost" type="button" onClick={() => setIsAddingCard(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="btn ghost" type="button" onClick={() => setIsAddingCard(true)}>
          + Card
        </button>
      )}
    </section>
  );
}
