import { generateAccentColor, IMPORTANCE_COLORS } from "../utils/color.js";

const STORAGE_VERSION = 2;

const createId = () => crypto.randomUUID();

export const createInitialBoard = () => ({
  version: STORAGE_VERSION,
  columns: [
    {
      id: createId(),
      title: "Ideas",
      cards: [
        {
          id: createId(),
          title: "Landing Page",
          description: "First sketches for hero and CTA",
          screenshots: [],
          accent: generateAccentColor("Landing Page"),
          importance: null,
        },
      ],
    },
    {
      id: createId(),
      title: "In Progress",
      cards: [],
    },
    {
      id: createId(),
      title: "Done",
      cards: [],
    },
  ],
});

export const addColumn = (board, title) => ({
  ...board,
  columns: [
    ...board.columns,
    {
      id: createId(),
      title,
      cards: [],
    },
  ],
});

export const updateColumn = (board, columnId, title) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId ? { ...column, title } : column
  ),
});

export const deleteColumn = (board, columnId) => ({
  ...board,
  columns: board.columns.filter((column) => column.id !== columnId),
});

export const addCard = (board, columnId, title) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: [
            ...column.cards,
            {
              id: createId(),
              title,
              description: "",
              screenshots: [],
              accent: generateAccentColor(title),
              importance: null,
            },
          ],
        }
      : column
  ),
});

export const updateCard = (board, columnId, cardId, payload) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: column.cards.map((card) => {
            if (card.id !== cardId) return card;
            const merged = { ...card, ...payload };
            const imp = merged.importance;
            if (imp && IMPORTANCE_COLORS[imp]) {
              merged.accent = IMPORTANCE_COLORS[imp];
            } else if (payload.accent) {
              merged.accent = payload.accent;
            } else if (payload.title) {
              merged.accent = generateAccentColor(payload.title);
            }
            return merged;
          }),
        }
      : column
  ),
});

export const deleteCard = (board, columnId, cardId) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: column.cards.filter((card) => card.id !== cardId),
        }
      : column
  ),
});

export const moveCard = (board, fromColumnId, toColumnId, cardId) => {
  if (fromColumnId === toColumnId) {
    return board;
  }
  let movedCard = null;
  const stripped = board.columns.map((column) => {
    if (column.id !== fromColumnId) {
      return column;
    }
    const remaining = column.cards.filter((card) => {
      if (card.id === cardId) {
        movedCard = card;
        return false;
      }
      return true;
    });
    return { ...column, cards: remaining };
  });

  if (!movedCard) {
    return board;
  }

  const injected = stripped.map((column) =>
    column.id === toColumnId ? { ...column, cards: [...column.cards, movedCard] } : column
  );

  return { ...board, columns: injected };
};

export const isBoardValid = (board) =>
  board && board.version === STORAGE_VERSION && Array.isArray(board.columns);

