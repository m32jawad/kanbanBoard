import React from "react";
import { generateRandomAccentColor } from "../utils/color.js";

const importanceLabel = { low: "Low", medium: "Medium", high: "High" };

export default function Card({ card, columnId, onOpen, onDelete, onUpdate }) {
  const handleDragStart = (event) => {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ cardId: card.id, fromColumnId: columnId })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <article className="card" style={{ borderColor: card.accent }} draggable onDragStart={handleDragStart}>
      <button type="button" className="card-body" onClick={onOpen}>
        <div className="card-accent" style={{ background: card.accent }} />
        <h3>{card.title}</h3>
        {card.description ? <p>{card.description.slice(0, 80)}</p> : null}
        <div className="card-pills">
          {card.importance ? (
            <span className="pill" style={{ background: card.accent + "33", color: card.accent }}>
              {importanceLabel[card.importance]}
            </span>
          ) : null}
          {card.screenshots.length ? (
            <span className="pill">{card.screenshots.length} screenshot(s)</span>
          ) : null}
        </div>
      </button>
      <div className="card-actions">
        <button className="btn ghost" type="button" onClick={() => onUpdate({ accent: generateRandomAccentColor() })}>
          Recolor
        </button>
        <button className="btn ghost" type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}
