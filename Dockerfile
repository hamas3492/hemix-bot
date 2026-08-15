# Stage 1: Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Install build essential tools for native packages
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    sqlite3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy package management files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Compile TypeScript
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Stage 2: Runtime stage
FROM node:18-slim AS runtime

WORKDIR /app

# Install runtime dependencies including ffmpeg for media processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled code and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/dashboard/public ./dashboard/public

# Create data directory for persistent sqlite and session data
RUN mkdir -p /app/data

# Environment configuration — PORT comes from hosting platform, not hardcoded
ENV NODE_ENV=production

# Katabump / Railway / Render / Heroku all set PORT automatically
# Do NOT hardcode PORT here — let the platform decide
EXPOSE ${PORT:-3000}
VOLUME /app/data

CMD ["node", "index.js"]
