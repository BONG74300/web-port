/**
 * MyProxy Dockerfile
 * Node.js 20 slim image with production setup
 */
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy server files
COPY server/package.json ./server/package.json
COPY server/server.js ./server/server.js
COPY server/utils ./server/utils

# Copy frontend files
COPY frontend ./frontend

# Install dependencies
WORKDIR /app/server
RUN npm install --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Run server
CMD ["node", "server.js"]
