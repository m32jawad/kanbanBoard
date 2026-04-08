import React, { useEffect, useState } from "react";

const IMPORTANCE_OPTIONS = [
  { value: "", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function AddTaskModal({ columns, initialColumnId, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [columnId, setColumnId] = useState(initialColumnId || columns[0]?.id || "");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [importance, setImportance] = useState("");

  useEffect(() => {
    setColumnId(initialColumnId || columns[0]?.id || "");
  }, [initialColumnId, columns]);

  const submit = (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !columnId) {
      return;
    }

    onCreate({
      columnId,
      title: trimmed,
      description: description.trim(),
      assignee: assignee.trim(),
      dueDate,
      importance: importance || null,
    });
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-content">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Create</p>
            <h2>Add Task</h2>
          </div>
          <button className="btn ghost" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="modal-body" onSubmit={submit}>
          <label className="field">
            Title
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
          </label>

          <label className="field">
            Stage
            <select value={columnId} onChange={(event) => setColumnId(event.target.value)}>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Notes
            <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <div className="field two-col-fields">
            <label className="field compact">
              Assignee
              <input type="text" value={assignee} onChange={(event) => setAssignee(event.target.value)} />
            </label>
            <label className="field compact">
              Due date
              <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>
          </div>

          <label className="field">
            Importance
            <select value={importance} onChange={(event) => setImportance(event.target.value)}>
              {IMPORTANCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-actions">
            <button className="btn primary" type="submit">
              Create task
            </button>
            <button className="btn ghost" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
