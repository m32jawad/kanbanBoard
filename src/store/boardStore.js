import { generateAccentColor, IMPORTANCE_COLORS, DEFAULT_ACCENT } from "../utils/color.js";

const STORAGE_VERSION = 2;

const createId = () => crypto.randomUUID();

const normalizeImportance = (value) => {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  return null;
};

const createCardPayload = (title, payload = {}) => {
  const normalizedTitle = String(title || "").trim() || "Untitled Task";
  const importance = normalizeImportance(payload.importance);
  const accent = importance
    ? IMPORTANCE_COLORS[importance]
    : payload.accent || generateAccentColor(normalizedTitle);

  return {
    id: createId(),
    title: normalizedTitle,
    description: payload.description || "",
    screenshots: Array.isArray(payload.screenshots) ? payload.screenshots : [],
    accent,
    importance,
    assignee: payload.assignee || "",
    dueDate: payload.dueDate || "",
  };
};

export const createInitialBoard = () => ({
  version: STORAGE_VERSION,
  columns: [
    {
      id: createId(),
      title: "Ideas",
      cards: [
        createCardPayload("Landing Page", {
          description: "First sketches for hero and CTA",
        }),
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

export const moveColumn = (board, fromIndex, toIndex) => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= board.columns.length ||
    toIndex >= board.columns.length
  ) {
    return board;
  }

  const columns = [...board.columns];
  const [moved] = columns.splice(fromIndex, 1);
  columns.splice(toIndex, 0, moved);
  return { ...board, columns };
};

export const addCard = (board, columnId, title) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: [...column.cards, createCardPayload(title)],
        }
      : column
  ),
});

export const addTask = (board, columnId, payload) => ({
  ...board,
  columns: board.columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: [...column.cards, createCardPayload(payload.title, payload)],
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
            const imp = normalizeImportance(merged.importance);
            merged.importance = imp;
            if (imp && IMPORTANCE_COLORS[imp]) {
              merged.accent = IMPORTANCE_COLORS[imp];
            } else if (!imp) {
              merged.accent = DEFAULT_ACCENT;
            } else if (payload.accent) {
              merged.accent = payload.accent;
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

export const importTasks = (board, tasks, options = {}) => {
  const importMode = options.mode || "append";
  const fallbackColumnId = board.columns[0]?.id;
  if (!fallbackColumnId || !Array.isArray(tasks) || !tasks.length) {
    return board;
  }

  const nextBoard =
    importMode === "replace"
      ? {
          ...board,
          columns: board.columns.map((column) => ({ ...column, cards: [] })),
        }
      : { ...board, columns: board.columns.map((column) => ({ ...column, cards: [...column.cards] })) };

  const targetColumnByTitle = new Map(
    nextBoard.columns.map((column) => [column.title.trim().toLowerCase(), column.id])
  );

  tasks.forEach((task) => {
    const targetId =
      targetColumnByTitle.get(String(task.column || "").trim().toLowerCase()) || fallbackColumnId;
    const columnIndex = nextBoard.columns.findIndex((column) => column.id === targetId);
    if (columnIndex < 0) {
      return;
    }

    const createdCard = createCardPayload(task.title, {
      description: task.description,
      importance: task.importance,
      assignee: task.assignee,
      dueDate: task.dueDate,
    });

    nextBoard.columns[columnIndex] = {
      ...nextBoard.columns[columnIndex],
      cards: [...nextBoard.columns[columnIndex].cards, createdCard],
    };
  });

  return nextBoard;
};

export const isBoardValid = (board) =>
  board && board.version === STORAGE_VERSION && Array.isArray(board.columns);

