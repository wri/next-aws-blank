# Build stage
FROM node:20.19.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Build arg for Next.js public env vars (baked at build time)
ARG NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Build the application
# NODE_TLS_REJECT_UNAUTHORIZED=0: allows font downloads behind TLS-inspecting proxies (e.g. Zscaler)
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build

# Production stage
FROM node:20.19.0-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Download AWS RDS root CA bundle for SSL database connections
# HTTP repos + --no-check-certificate: allows builds behind TLS-inspecting proxies (e.g. Zscaler)
RUN sed -i 's/https/http/' /etc/apk/repositories && \
    apk add --no-cache wget ca-certificates && \
    wget --no-check-certificate -q \
      https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
      -O /app/global-bundle.pem && \
    apk del wget

ENV NODE_EXTRA_CA_CERTS=/app/global-bundle.pem

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json for potential runtime dependencies
COPY --from=builder /app/package.json ./package.json

# Set correct ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]