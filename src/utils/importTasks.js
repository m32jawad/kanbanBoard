const normalizeImportance = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }
  return null;
};

const normalizeTask = (task) => {
  const title = String(task.title || "").trim();
  if (!title) {
    return null;
  }

  return {
    title,
    description: String(task.description || "").trim(),
    column: String(task.column || "").trim(),
    assignee: String(task.assignee || "").trim(),
    dueDate: String(task.dueDate || "").trim(),
    importance: normalizeImportance(task.importance),
  };
};

const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }

  cells.push(current.trim());
  return cells;
};

export const parseTasksFromCsv = (csvText) => {
  const lines = String(csvText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || "";
      });
      return normalizeTask({
        title: record.title,
        description: record.description,
        column: record.column,
        assignee: record.assignee,
        dueDate: record.duedate,
        importance: record.importance,
      });
    })
    .filter(Boolean);
};

export const parseTasksFromJson = (jsonText) => {
  const parsed = JSON.parse(jsonText);
  const list = Array.isArray(parsed) ? parsed : parsed.tasks;
  if (!Array.isArray(list)) {
    throw new Error("JSON must be an array or an object with a tasks array");
  }

  return list.map(normalizeTask).filter(Boolean);
};

export const parseTasksFromQuickText = (quickText) => {
  const rows = String(quickText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return rows
    .map((row) => {
      const parts = row.split("|").map((part) => part.trim());
      return normalizeTask({
        title: parts[0],
        column: parts[1],
        assignee: parts[2],
        dueDate: parts[3],
        importance: parts[4],
        description: parts[5],
      });
    })
    .filter(Boolean);
};
