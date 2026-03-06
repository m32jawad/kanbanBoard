# Kanban Board

A minimal, modern Kanban board app with column & card CRUD, automatic accent colors, drag & drop, importance levels, and card details with text and screenshots.

Backend-powered with SQLite for multi-user support.

## Features

- Add, edit, and delete columns
- Cards with title, notes, and automatic accent color
- Recolor cards manually
- Set importance (Low / Medium / High) — card color adapts automatically (green / yellow / red)
- Drag & drop cards between columns
- Card detail view with screenshot upload, preview, and scrollable gallery
- Backend API with SQLite database
- Local or server deployment

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
- `PORT` (backend): Server port (default: `3001`)
- `DATABASE_PATH` (backend): SQLite file path (default: `./data/kanban.db`)
- `CORS_ORIGIN` (backend): Allowed frontend origin (default: `*`)
- `NODE_ENV` (backend): `development` or `production`

