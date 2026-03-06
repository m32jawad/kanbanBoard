import React, { useMemo, useState, useEffect } from "react";
import Board from "./components/Board.jsx";
import CardDetail from "./components/CardDetail.jsx";
import { createInitialBoard, addColumn, updateColumn, deleteColumn } from "./store/boardStore.js";
import { addCard, updateCard, deleteCard, moveCard } from "./store/boardStore.js";
import { loadBoard, saveBoard } from "./store/api.js";

export default function App() {
  const [board, setBoard] = useState(null);
  const [activeCardRef, setActiveCardRef] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const onDeleteColumn = (columnId) => {
    if (activeCardEntry?.columnId === columnId) {
      setActiveCardRef(null);
    }
    applyBoard(deleteColumn(board, columnId));
  };

  const onAddCard = (columnId, title) => applyBoard(addCard(board, columnId, title));
  const onUpdateCard = (columnId, cardId, payload) => applyBoard(updateCard(board, columnId, cardId, payload));
  const onDeleteCard = (columnId, cardId) => {
    if (activeCardEntry?.card.id === cardId) {
      setActiveCardRef(null);
    }
    applyBoard(deleteCard(board, columnId, cardId));
  };

  const onMoveCard = (fromColumnId, toColumnId, cardId) =>
    applyBoard(moveCard(board, fromColumnId, toColumnId, cardId));

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
          <h1>Board</h1>
        </div>
      </header>
      <Board
        board={board}
        onAddColumn={onAddColumn}
        onUpdateColumn={onUpdateColumn}
        onDeleteColumn={onDeleteColumn}
        onAddCard={onAddCard}
        onUpdateCard={onUpdateCard}
        onDeleteCard={onDeleteCard}
        onMoveCard={onMoveCard}
        onOpenCard={(cardId) => setActiveCardRef(cardId)}
      />
      {activeCardEntry && (
        <CardDetail
          card={activeCardEntry.card}
          onClose={() => setActiveCardRef(null)}
          onUpdate={(payload) => onUpdateCard(activeCardEntry.columnId, activeCardEntry.card.id, payload)}
        />
      )}
    </div>
  );
}
