#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
bash ./deploy/backup.sh
git pull --ff-only origin main
docker compose --env-file .env.production config >/dev/null
docker compose --env-file .env.production up -d --build --remove-orphans
docker image prune -f

docker compose --env-file .env.production ps
