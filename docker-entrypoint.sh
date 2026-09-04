#!/bin/sh
set -e

mkdir -p /app/data
if [ ! -f /app/data/dev.db ]; then
  echo "[entrypoint] No database found — initializing from seed data."
  cp /app/prisma/seed.db /app/data/dev.db
else
  echo "[entrypoint] Existing database found — reusing /app/data/dev.db."
fi

echo "[entrypoint] Starting Phoneme Activity Builder on port ${PORT:-3000}."
exec node server.js
