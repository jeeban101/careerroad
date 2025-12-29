# syntax=docker/dockerfile:1

# --- Builder stage: install deps and build the app (client + server) ---
FROM node:20-alpine AS builder
WORKDIR /app/client

# Install dependencies (use ci for reproducible builds)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build:
# - Vite builds client to dist/public
# - esbuild bundles server to dist/*
RUN npm run build

# --- Runner stage: only production deps + built artifacts ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies (cross-env is a devDep; we won't use npm start)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/client/dist ./dist

# The app listens on 8005 by default (NODE_PORT env can override)
EXPOSE 8005

# Do not use "npm start" because it depends on cross-env (a devDependency)
CMD ["node", "dist/index.js"]
