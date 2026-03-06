#!/bin/bash
# ============================================================
# deploy.sh — Deploy Kanban Board on Ubuntu server via Docker
# Usage: bash deploy.sh
# ============================================================

set -e

APP_NAME="kanban-board"
PORT=3001                         # local port the container binds to
DATA_DIR="/opt/kanban-data"       # persistent SQLite data directory
IMAGE="$APP_NAME:latest"

echo "========================================"
echo " Kanban Board — Deployment Script"
echo "========================================"

# ── 1. Build Docker image ────────────────────────────────────
echo ""
echo "[1/4] Building Docker image..."
docker build -t "$IMAGE" .

# ── 2. Stop & remove old container ──────────────────────────
echo ""
echo "[2/4] Stopping old container (if any)..."
docker stop "$APP_NAME" 2>/dev/null && echo "  Stopped $APP_NAME" || echo "  No running container found — skipping."
docker rm   "$APP_NAME" 2>/dev/null && echo "  Removed $APP_NAME" || echo "  No container to remove — skipping."

# ── 3. Create persistent data directory ─────────────────────
echo ""
echo "[3/4] Ensuring data directory exists at $DATA_DIR..."
mkdir -p "$DATA_DIR"

# ── 4. Start new container ───────────────────────────────────
echo ""
echo "[4/4] Starting container..."
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p 127.0.0.1:${PORT}:3001 \
  -v "$DATA_DIR":/app/data \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATABASE_PATH=/app/data/kanban.db \
  "$IMAGE"

echo ""
echo "========================================"
echo " ✅ Deployed!  http://localhost:${PORT}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Copy the location block from  nginx-kanbanboard.conf"
echo "     into your existing nginx server{} block."
echo "  2. Test config:  sudo nginx -t"
echo "  3. Reload nginx: sudo systemctl reload nginx"
echo ""
echo "Useful commands:"
echo "  Logs:    docker logs -f $APP_NAME"
echo "  Stop:    docker stop $APP_NAME"
echo "  Restart: docker restart $APP_NAME"
