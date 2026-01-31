# syntax=docker/dockerfile:1

# --- Build stage: build the Vite client ---
FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

# Install deps
COPY package*.json ./
RUN NODE_ENV=dev npm i

# Copy source and build
COPY . .

# This uses client/vite.config.ts which outputs to dist/public
RUN npm run build

# --- Runtime stage: serve static files with Nginx on port 80 ---
FROM nginx:1.27-alpine AS runner

# Replace default server config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built artifacts to nginx html root
COPY --from=builder /app/dist/public /usr/share/nginx/html

EXPOSE 80 443

# Nginx default CMD is fine
