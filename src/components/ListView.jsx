import React, { useMemo, useState } from "react";

const importanceLabel = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function ListView({ board, onOpenCard, onMoveCard }) {
  const [query, setQuery] = useState("");
  const [columnFilter, setColumnFilter] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");

  const rows = useMemo(() => {
    const flat = [];
    board.columns.forEach((column) => {
      column.cards.forEach((card) => {
        flat.push({
          columnId: column.id,
          columnTitle: column.title,
          card,
        });
      });
    });

    return flat.filter((row) => {
      if (columnFilter !== "all" && row.columnId !== columnFilter) {
        return false;
      }
      if (importanceFilter !== "all" && (row.card.importance || "none") !== importanceFilter) {
        return false;
      }
      if (!query.trim()) {
        return true;
      }

      const search = query.toLowerCase();
      return (
        row.card.title.toLowerCase().includes(search) ||
        row.card.description.toLowerCase().includes(search) ||
        row.card.assignee.toLowerCase().includes(search)
      );
    });
  }, [board, query, columnFilter, importanceFilter]);

  return (
    <section className="list-view">
      <div className="list-controls">
        <input
          type="text"
          className="list-search"
          placeholder="Search title, notes, assignee"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={columnFilter} onChange={(event) => setColumnFilter(event.target.value)}>
          <option value="all">All columns</option>
          {board.columns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
        <select value={importanceFilter} onChange={(event) => setImportanceFilter(event.target.value)}>
          <option value="all">All priority</option>
          <option value="none">No priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="list-table-wrap">
        <table className="list-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Due</th>
              <th>Priority</th>
              <th>Move to</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.card.id}>
                  <td>
                    <button className="task-link" type="button" onClick={() => onOpenCard(row.card.id)}>
                      {row.card.title}
                    </button>
                    {row.card.description ? <p>{row.card.description.slice(0, 90)}</p> : null}
                  </td>
                  <td>{row.columnTitle}</td>
                  <td>{row.card.assignee || "-"}</td>
                  <td>{row.card.dueDate || "-"}</td>
                  <td>
                    {row.card.importance ? (
                      <span className="pill" style={{ background: row.card.accent + "33", color: row.card.accent }}>
                        {importanceLabel[row.card.importance]}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <select
                      value={row.columnId}
                      onChange={(event) => onMoveCard(row.columnId, event.target.value, row.card.id)}
                    >
                      {board.columns.map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="empty">No tasks match these filters.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
