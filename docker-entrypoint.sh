#!/bin/sh
set -eu

mkdir -p /data
npx prisma db push --skip-generate

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  npx tsx prisma/seed.ts
fi

exec npm run start -- -H 0.0.0.0
