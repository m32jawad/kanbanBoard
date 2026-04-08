const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODELS = [
  import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
];

const stripCodeFence = (text) => {
  const trimmed = String(text || "").trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }
  return trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
};

const parseModelJson = (text) => {
  const cleaned = stripCodeFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("AI response was not valid JSON.");
  }
};

const normalizeImportance = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }
  return null;
};

const normalizeTask = (task) => {
  const title = String(task?.title || "").trim();
  if (!title) {
    return null;
  }
  return {
    title,
    description: String(task.description || "").trim(),
    assignee: String(task.assignee || "").trim(),
    dueDate: String(task.dueDate || "").trim(),
    importance: normalizeImportance(task.importance),
  };
};

export const extractTasksWithGemini = async ({ rawText, apiKey }) => {
  const key = String(apiKey || "").trim();
  if (!key) {
    throw new Error("Gemini API key is required.");
  }

  const prompt = [
    "You are a task extraction assistant.",
    "Read the user update text and create actionable project tasks.",
    "If the text represents one task, return one task. If it implies multiple tasks, split into multiple tasks.",
    "Return ONLY a JSON array. Do not include markdown.",
    "Each item must use this shape:",
    '{"title":"string","description":"string","assignee":"string","dueDate":"YYYY-MM-DD or empty","importance":"low|medium|high or empty"}',
    "Do not invent fake dates unless clearly implied.",
    "Source message:",
    rawText,
  ].join("\n");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
    },
  };

  let text = "";
  let lastError = "";

  for (const modelName of DEFAULT_MODELS) {
    const endpoint = `${API_ROOT}/${modelName}:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const details = await response.text();
      lastError = `Gemini model ${modelName} failed: ${response.status} ${details}`;
      continue;
    }

    const data = await response.json();
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (text) {
      break;
    }

    lastError = `Gemini model ${modelName} returned an empty response.`;
  }

  if (!text) {
    throw new Error(lastError || "Gemini returned an empty response.");
  }

  const parsed = parseModelJson(text);
  if (!Array.isArray(parsed)) {
    throw new Error("Gemini output must be a JSON array of tasks.");
  }

  const tasks = parsed.map(normalizeTask).filter(Boolean);
  if (!tasks.length) {
    throw new Error("No valid tasks were extracted from the message.");
  }

  return tasks;
};
