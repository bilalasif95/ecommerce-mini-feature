# Multi-stage Docker build for production optimization
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies (no lockfile required)
RUN npm install --omit=dev

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend-builder

# Set working directory
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies (no lockfile required)
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ ./

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend dependencies and source
COPY --from=backend-builder /app/backend ./

# Copy frontend build from frontend-builder stage
COPY --from=frontend-builder /app/frontend/build ./public

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Start the application
CMD ["node", "server.js"]