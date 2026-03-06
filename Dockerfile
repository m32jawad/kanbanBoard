# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --production && \
    apk add --no-cache python3 make g++

# Copy built files and server
COPY --from=build /app/dist ./dist
COPY server ./server
COPY .env.example .env

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/kanban.db

CMD ["node", "server/index.js"]

