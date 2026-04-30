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

# Download AWS RDS root CA bundle for SSL database connections.
# HTTP repos + --no-check-certificate: allows builds behind TLS-inspecting proxies (e.g. Zscaler).
# wget:    used by the HEALTHCHECK and the ECS task health check at runtime.
# su-exec: tiny tool used by the entrypoint to drop privileges to the nextjs user.
RUN sed -i 's/https/http/' /etc/apk/repositories && \
    apk add --no-cache wget ca-certificates su-exec && \
    wget --no-check-certificate -q \
      https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
      -O /app/global-bundle.pem

ENV NODE_EXTRA_CA_CERTS=/app/global-bundle.pem

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json for potential runtime dependencies
COPY --from=builder /app/package.json ./package.json

# Entrypoint script fixes ownership of runtime-mounted volumes (ECS ephemeral
# volumes are root-owned regardless of USER), then drops privileges to nextjs.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set correct ownership
RUN chown -R nextjs:nodejs /app

# NOTE: We intentionally do NOT switch USER here. The entrypoint starts as
# root, fixes mount ownership, then exec's the app as nextjs via su-exec.

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]