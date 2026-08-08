#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p backups
stamp=$(date -u +%Y%m%d-%H%M%S)
archive="backups/foresight-$stamp.tar.gz"

restart_web() {
  docker compose --env-file .env.production start web >/dev/null 2>&1 || true
}
trap restart_web EXIT

docker compose --env-file .env.production stop web
tar -czf "$archive" storage .env.production
docker compose --env-file .env.production start web
trap - EXIT

find backups -type f -name 'foresight-*.tar.gz' -mtime +14 -delete
echo "Backup created: $archive"
