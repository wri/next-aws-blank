# Build stage
FROM node:20.20.2-alpine AS builder

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
FROM node:20.20.2-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# A non-root nextjs user is created here for possible future use, but this
# image does not switch to that user by default. Unless an orchestrator
# overrides the runtime user, the container runs as root — see the
# explanatory comment further down for the rationale.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Download AWS RDS root CA bundle for SSL database connections.
# HTTP repos + --no-check-certificate: allows builds behind TLS-inspecting proxies (e.g. Zscaler).
# wget: used by the HEALTHCHECK and the ECS task health check at runtime.
RUN sed -i 's/https/http/' /etc/apk/repositories && \
    apk add --no-cache wget ca-certificates && \
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

# Pre-create the mount target for the ECS ephemeral volume. With
# readonlyRootFilesystem=true the kernel cannot create the mount point at
# runtime, so the directory must exist in the image.
RUN mkdir -p /app/.next/cache

# We intentionally run as root inside the container. On Fargate, capability
# additions are not allowed (only drops), so the chown-then-drop-privileges
# pattern doesn't work. The ECS task definition drops ALL Linux capabilities,
# leaving root with no real privileges, while readonlyRootFilesystem and
# Fargate's VM-level isolation provide the security boundary.
# (The nextjs user is left in /etc/passwd in case we ever move off Fargate.)

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]