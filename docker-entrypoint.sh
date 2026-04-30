#!/bin/sh
set -eu

# ECS ephemeral volumes (mounted at /tmp and /app/.next/cache) are owned by
# root regardless of the image's USER directive. Fix ownership for the paths
# the app needs to write to, then drop privileges to the unprivileged user.
#
# We intentionally do NOT swallow errors: if chown fails (e.g. capabilities
# were not granted to the task) we want to fail fast with a clear error,
# rather than letting the app crash later with a confusing EACCES.
mkdir -p /app/.next/cache /tmp
chown -R nextjs:nodejs /app/.next/cache /tmp

# Drop to the non-root user and exec the application (PID 1).
exec su-exec nextjs:nodejs "$@"
