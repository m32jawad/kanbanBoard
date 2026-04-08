import React, { useMemo, useState } from "react";
import { extractTasksWithGemini } from "../utils/smartExtract.js";

const CSV_TEMPLATE = "title,column,assignee,dueDate,importance,description\nDesign homepage,Ideas,Ana,2026-04-22,high,Create wireframes";
const QUICK_TEMPLATE = "Task title | Column | Assignee | YYYY-MM-DD | low|medium|high | Description";

const findDefaultTodoColumnId = (columns) => {
  const todo = columns.find((column) => {
    const title = column.title.trim().toLowerCase();
    return title === "todo" || title === "to do";
  });
  return todo?.id || columns[0]?.id || "";
};

export default function ImportTasksModal({ columns, onClose, onImport, onCreateTasks }) {
  const [mode, setMode] = useState("json");
  const [replaceMode, setReplaceMode] = useState(false);
  const [payload, setPayload] = useState("");
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || "");
  const [smartInput, setSmartInput] = useState("");
  const [extractError, setExtractError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [draftTasks, setDraftTasks] = useState([]);

  const defaultTodoColumnId = useMemo(() => findDefaultTodoColumnId(columns), [columns]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === "smart") {
      onCreateTasks(draftTasks);
      return;
    }

    onImport({
      source: mode,
      text: payload,
      importMode: replaceMode ? "replace" : "append",
    });
  };

  const handleExtract = async () => {
    try {
      setIsExtracting(true);
      const extracted = await extractTasksWithGemini({
        rawText: smartInput,
        apiKey,
      });

      setDraftTasks(
        extracted.map((task) => ({
          ...task,
          columnId: defaultTodoColumnId,
        }))
      );
      setExtractError("");
    } catch (error) {
      setExtractError(error.message || "Failed to extract tasks from message.");
    } finally {
      setIsExtracting(false);
    }
  };

  const updateDraftTask = (index, patch) => {
    setDraftTasks((prev) => prev.map((task, i) => (i === index ? { ...task, ...patch } : task)));
  };

  const removeDraftTask = (index) => {
    setDraftTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const helperText =
    mode === "json"
      ? "Paste a JSON array of tasks, or an object with a tasks array."
      : mode === "csv"
        ? `Header order: ${CSV_TEMPLATE.split("\\n")[0]}`
        : mode === "quick"
          ? QUICK_TEMPLATE
          : "Paste a project update message. AI will convert it into one or many tasks.";

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-content import-modal">
        <header className="modal-header">
          <div>
            <p className="eyebrow">Bulk Import</p>
            <h2>Import Tasks</h2>
          </div>
          <button className="btn ghost" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="field">
            Format
            <div className="segmented">
              <button type="button" className={`btn ${mode === "json" ? "primary" : "ghost"}`} onClick={() => setMode("json")}>
                JSON
              </button>
              <button type="button" className={`btn ${mode === "csv" ? "primary" : "ghost"}`} onClick={() => setMode("csv")}>
                CSV
              </button>
              <button type="button" className={`btn ${mode === "quick" ? "primary" : "ghost"}`} onClick={() => setMode("quick")}>
                Quick Paste
              </button>
              <button type="button" className={`btn ${mode === "smart" ? "primary" : "ghost"}`} onClick={() => setMode("smart")}>
                Smart Extract
              </button>
            </div>
          </label>

          {mode !== "smart" ? (
            <label className="field">
              Task data
              <textarea
                rows={12}
                placeholder={helperText}
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
              />
            </label>
          ) : (
            <>
              <label className="field">
                Gemini API key
                <input
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                />
              </label>
              <label className="field">
                Raw update message
                <textarea
                  rows={8}
                  placeholder={helperText}
                  value={smartInput}
                  onChange={(event) => setSmartInput(event.target.value)}
                />
              </label>
              <div className="inline-actions">
                <button className="btn" type="button" onClick={handleExtract} disabled={isExtracting}>
                  {isExtracting ? "Extracting..." : "Analyze with AI"}
                </button>
              </div>
              {extractError ? <p className="import-error">{extractError}</p> : null}

              {draftTasks.length ? (
                <div className="smart-drafts">
                  {draftTasks.map((task, index) => (
                    <article key={`${task.title}-${index}`} className="smart-draft-item">
                      <label className="field">
                        Task title
                        <input
                          type="text"
                          value={task.title}
                          onChange={(event) => updateDraftTask(index, { title: event.target.value })}
                        />
                      </label>
                      <label className="field">
                        Description
                        <textarea
                          rows={3}
                          value={task.description}
                          onChange={(event) => updateDraftTask(index, { description: event.target.value })}
                        />
                      </label>
                      <div className="smart-draft-grid">
                        <label className="field compact">
                          Stage
                          <select
                            value={task.columnId || defaultTodoColumnId}
                            onChange={(event) => updateDraftTask(index, { columnId: event.target.value })}
                          >
                            {columns.map((column) => (
                              <option key={column.id} value={column.id}>
                                {column.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field compact">
                          Assignee
                          <input
                            type="text"
                            value={task.assignee || ""}
                            onChange={(event) => updateDraftTask(index, { assignee: event.target.value })}
                          />
                        </label>
                        <label className="field compact">
                          Due date
                          <input
                            type="date"
                            value={task.dueDate || ""}
                            onChange={(event) => updateDraftTask(index, { dueDate: event.target.value })}
                          />
                        </label>
                        <label className="field compact">
                          Importance
                          <select
                            value={task.importance || ""}
                            onChange={(event) => updateDraftTask(index, { importance: event.target.value || null })}
                          >
                            <option value="">None</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </label>
                      </div>
                      <button className="btn ghost" type="button" onClick={() => removeDraftTask(index)}>
                        Remove task
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {mode !== "smart" ? (
            <label className="checkbox-row">
              <input type="checkbox" checked={replaceMode} onChange={(event) => setReplaceMode(event.target.checked)} />
              Replace all existing cards before import
            </label>
          ) : null}

          <div className="inline-actions">
            <button className="btn primary" type="submit">
              {mode === "smart" ? "Add extracted tasks" : "Import tasks"}
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
