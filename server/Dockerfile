# ─── SkillBridge Backend Dockerfile ───────────────────────────────────────────
# Multi-stage build: Dependency install → Lean production image

# Stage 1: Build dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Run as non-root user
RUN addgroup --system skillbridge && \
    adduser --system --ingroup skillbridge skillbridge

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (excluding what's in .dockerignore)
COPY . .

# Set ownership to non-root user
RUN chown -R skillbridge:skillbridge /app

USER skillbridge

# Expose the API port
EXPOSE 5000

# Health check — Docker will restart the container if this fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Start the server
CMD ["node", "server.js"]
