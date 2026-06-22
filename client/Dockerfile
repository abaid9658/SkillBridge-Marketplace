# ─── SkillBridge Client Dockerfile ────────────────────────────────────────────
# Multi-stage: Build with Node → Serve with Nginx (tiny final image)

# Stage 1: Build the React/Vite app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# VITE_API_URL is injected at build time via --build-arg or CI env var
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (SPA routing + security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config to avoid conflicts
RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
