# Kanban Board

A minimal, modern Kanban board app with column & card CRUD, automatic accent colors, drag & drop, importance levels, and card details with text and screenshots.

Backend-powered with SQLite for multi-user support.

## Features

- Add, edit, and delete columns
- Cards with title, notes, and automatic accent color
- Assign tasks to owners and set due dates
- Recolor cards manually
- Set importance (Low / Medium / High) — card color adapts automatically (green / yellow / red)
- Drag & drop cards between columns
- List View for filtering and managing tasks in a table
- Task plan panel with workflow and operational metrics
- Bulk task import using JSON, CSV, or quick-paste text
- Smart Extract using Gemini: convert raw update messages into one or many editable tasks
- Card detail view with screenshot upload, preview, and scrollable gallery
- Backend API with SQLite database
- Local or server deployment

## Task Management Plan

Use this flow to improve assignment and delivery consistency:

1. Capture: Add all incoming work in `Ideas` with a clear task title.
2. Prioritize: Set `importance` and `due date` during triage.
3. Assign: Ensure each task has an `assignee` before moving to `In Progress`.
4. Execute: Use Kanban view for drag-and-drop execution.
5. Review: Use List View daily to spot unassigned, overdue, and high-priority work.
6. Close: Move completed work to `Done` and keep notes/screenshots for traceability.

## Importing Tasks

Open `Import Tasks` from the top bar and choose one format.

### Smart Extract (AI)

Use `Smart Extract` in the import modal:

1. Paste the raw message/update from chat, email, or standup notes.
2. Provide a Gemini API key (or configure `VITE_GEMINI_API_KEY`).
3. Click `Analyze with AI`.
4. Review the generated tasks, edit fields, and choose stage per task.
5. Click `Add extracted tasks` to add them to the board.

Default stage is `Todo` if available, otherwise the first board column is used.

### JSON format

```json
[
	{
		"title": "Finalize pricing page",
		"column": "Ideas",
		"assignee": "Mina",
		"dueDate": "2026-04-24",
		"importance": "high",
		"description": "Align with marketing copy"
	}
]
```

### CSV format

```csv
title,column,assignee,dueDate,importance,description
Finalize pricing page,Ideas,Mina,2026-04-24,high,Align with marketing copy
```

### Quick-paste format

Each line:

```text
Task title | Column | Assignee | YYYY-MM-DD | low|medium|high | Description
```

## Getting Started

### Development

```zsh
npm install
cp .env.example .env
# Edit .env if needed
npm run dev:all  # Starts both frontend (port 5173) and backend (port 3001)
```

Or run separately:
```zsh
npm run dev         # Frontend only
npm run dev:server  # Backend only
```

### Production

```zsh
npm install
npm run build
NODE_ENV=production npm start
```

See `DEPLOYMENT.md` for full server deployment guide.

## Tests

```zsh
npm test
```

## Environment Variables

- `VITE_API_URL` (frontend): API endpoint (default: `http://localhost:3001`)
- `VITE_GEMINI_API_KEY` (frontend): Gemini API key for Smart Extract
- `VITE_GEMINI_MODEL` (frontend): Optional Gemini model override (default: `gemini-2.5-flash`)
- `PORT` (backend): Server port (default: `3001`)
- `DATABASE_PATH` (backend): SQLite file path (default: `./data/kanban.db`)
- `CORS_ORIGIN` (backend): Allowed frontend origin (default: `*`)
- `NODE_ENV` (backend): `development` or `production`

