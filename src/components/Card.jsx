import React from "react";

const IMPORTANCE_CYCLE = [null, "low", "medium", "high"];
const IMPORTANCE_LABEL = { low: "Low", medium: "Medium", high: "High" };
const IMPORTANCE_COLOR = {
  low: "hsl(142 60% 45%)",
  medium: "hsl(45 90% 50%)",
  high: "hsl(0 72% 52%)",
};

export default function Card({ card, columnId, onOpen, onDelete, onUpdate }) {
  const handleDragStart = (event) => {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ cardId: card.id, fromColumnId: columnId })
    );
    event.dataTransfer.effectAllowed = "move";
    event.stopPropagation(); // don't trigger column drag
  };

  const cycleImportance = (event) => {
    event.stopPropagation();
    const current = card.importance ?? null;
    const idx = IMPORTANCE_CYCLE.indexOf(current);
    const next = IMPORTANCE_CYCLE[(idx + 1) % IMPORTANCE_CYCLE.length];
    onUpdate({ importance: next });
  };

  const importanceColor = card.importance ? IMPORTANCE_COLOR[card.importance] : "#6b7280";
  const importanceText = card.importance ? IMPORTANCE_LABEL[card.importance] : "None";

  return (
    <article className="card" style={{ borderColor: card.accent }} draggable onDragStart={handleDragStart}>
      <button type="button" className="card-body" onClick={onOpen}>
        <div className="card-accent" style={{ background: card.accent }} />
        <h3>{card.title}</h3>
        {card.description ? <p>{card.description.slice(0, 80)}</p> : null}
        <div className="card-pills">
          {card.importance ? (
            <span className="pill" style={{ background: importanceColor + "33", color: importanceColor }}>
              {importanceText}
            </span>
          ) : null}
          {card.screenshots?.length ? (
            <span className="pill">🖼 {card.screenshots.length}</span>
          ) : null}
        </div>
      </button>
      <div className="card-actions">
        <button
          className="btn ghost importance-cycle-btn"
          type="button"
          title={`Importance: ${importanceText}`}
          style={{ color: importanceColor, borderColor: importanceColor + "66" }}
          onClick={cycleImportance}
        >
          ● {importanceText}
        </button>
        <button className="btn ghost" type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}
