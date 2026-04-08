import React, { useMemo, useState, useEffect } from "react";
import Board from "./components/Board.jsx";
import CardDetail from "./components/CardDetail.jsx";
import ListView from "./components/ListView.jsx";
import ImportTasksModal from "./components/ImportTasksModal.jsx";
import AddTaskModal from "./components/AddTaskModal.jsx";
import TaskManagementPlan from "./components/TaskManagementPlan.jsx";
import { createInitialBoard, addColumn, updateColumn, deleteColumn } from "./store/boardStore.js";
import { updateCard, deleteCard, moveCard, moveColumn } from "./store/boardStore.js";
import { importTasks } from "./store/boardStore.js";
import { addTask } from "./store/boardStore.js";
import { loadBoard, saveBoard } from "./store/api.js";
import { parseTasksFromCsv, parseTasksFromJson, parseTasksFromQuickText } from "./utils/importTasks.js";

export default function App() {
  const [board, setBoard] = useState(null);
  const [activeCardRef, setActiveCardRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("board");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importModalMode, setImportModalMode] = useState("json");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    loadBoard().then((data) => {
      setBoard(data ?? createInitialBoard());
      setLoading(false);
    });
  }, []);

  const cardLookup = useMemo(() => {
    if (!board) return new Map();
    const map = new Map();
    board.columns.forEach((column) => {
      column.cards.forEach((card) => {
        map.set(card.id, { card, columnId: column.id });
      });
    });
    return map;
  }, [board]);

  const activeCardEntry = activeCardRef ? cardLookup.get(activeCardRef) : null;

  const applyBoard = (next) => {
    setBoard(next);
    saveBoard(next);
  };

  const onAddColumn = (title) => applyBoard(addColumn(board, title));
  const onUpdateColumn = (columnId, title) => applyBoard(updateColumn(board, columnId, title));
  const onMoveColumn = (fromIndex, toIndex) => applyBoard(moveColumn(board, fromIndex, toIndex));
  const onDeleteColumn = (columnId) => {
    if (activeCardEntry?.columnId === columnId) {
      setActiveCardRef(null);
    }
    applyBoard(deleteColumn(board, columnId));
  };

  const onAddCard = (columnId) => {
    setAddTaskColumnId(columnId);
    setShowAddTaskModal(true);
  };
  const onUpdateCard = (columnId, cardId, payload) => applyBoard(updateCard(board, columnId, cardId, payload));
  const onDeleteCard = (columnId, cardId) => {
    if (activeCardEntry?.card.id === cardId) {
      setActiveCardRef(null);
    }
    applyBoard(deleteCard(board, columnId, cardId));
  };

  const onMoveCard = (fromColumnId, toColumnId, cardId) =>
    applyBoard(moveCard(board, fromColumnId, toColumnId, cardId));

  const handleImport = ({ source, text, importMode }) => {
    try {
      const parser =
        source === "json"
          ? parseTasksFromJson
          : source === "csv"
            ? parseTasksFromCsv
            : parseTasksFromQuickText;

      const tasks = parser(text);
      if (!tasks.length) {
        throw new Error("No valid tasks found in import data.");
      }

      const nextBoard = importTasks(board, tasks, { mode: importMode });
      applyBoard(nextBoard);
      setImportError("");
      setShowImportModal(false);
    } catch (error) {
      setImportError(error.message || "Import failed. Check your format and try again.");
    }
  };

  const handleCreateTask = (taskPayload) => {
    const nextBoard = addTask(board, taskPayload.columnId, taskPayload);
    applyBoard(nextBoard);
    setShowAddTaskModal(false);
    setAddTaskColumnId("");
  };

  const handleCreateExtractedTasks = (tasks) => {
    if (!Array.isArray(tasks) || !tasks.length) {
      setImportError("No extracted tasks to add.");
      return;
    }

    const nextBoard = tasks.reduce((acc, task) => {
      const targetColumnId = task.columnId || acc.columns[0]?.id;
      if (!targetColumnId || !String(task.title || "").trim()) {
        return acc;
      }
      return addTask(acc, targetColumnId, task);
    }, board);

    applyBoard(nextBoard);
    setImportError("");
    setShowImportModal(false);
  };

  if (loading) {
    return (
      <div className="app">
        <div style={{ textAlign: "center", marginTop: "40px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Minimal Kanban</p>
          <h1>Task Management Hub</h1>
        </div>
        <div className="topbar-actions">
          <div className="segmented">
            <button
              className={`btn ${viewMode === "board" ? "primary" : "ghost"}`}
              type="button"
              onClick={() => setViewMode("board")}
            >
              Kanban
            </button>
            <button
              className={`btn ${viewMode === "list" ? "primary" : "ghost"}`}
              type="button"
              onClick={() => setViewMode("list")}
            >
              List View
            </button>
          </div>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setImportModalMode("json");
              setShowImportModal(true);
            }}
          >
            Import Tasks
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setImportModalMode("smart");
              setShowImportModal(true);
            }}
          >
            AI Task Extractor
          </button>
          <button className="btn primary" type="button" onClick={() => setShowAddTaskModal(true)}>
            Add Task
          </button>
        </div>
      </header>
      <TaskManagementPlan board={board} />
      {importError ? <p className="import-error">{importError}</p> : null}
      {viewMode === "board" ? (
        <Board
          board={board}
          onAddColumn={onAddColumn}
          onUpdateColumn={onUpdateColumn}
          onDeleteColumn={onDeleteColumn}
          onAddCard={onAddCard}
          onMoveColumn={onMoveColumn}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
          onMoveCard={onMoveCard}
          onOpenCard={(cardId) => setActiveCardRef(cardId)}
        />
      ) : (
        <ListView board={board} onOpenCard={(cardId) => setActiveCardRef(cardId)} onMoveCard={onMoveCard} />
      )}
      {activeCardEntry && (
        <CardDetail
          card={activeCardEntry.card}
          onClose={() => setActiveCardRef(null)}
          onUpdate={(payload) => onUpdateCard(activeCardEntry.columnId, activeCardEntry.card.id, payload)}
        />
      )}
      {showImportModal ? (
        <ImportTasksModal
          columns={board.columns}
          initialMode={importModalMode}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          onCreateTasks={handleCreateExtractedTasks}
        />
      ) : null}
      {showAddTaskModal ? (
        <AddTaskModal
          columns={board.columns}
          initialColumnId={addTaskColumnId}
          onClose={() => {
            setShowAddTaskModal(false);
            setAddTaskColumnId("");
          }}
          onCreate={handleCreateTask}
        />
      ) : null}
    </div>
  );
}
