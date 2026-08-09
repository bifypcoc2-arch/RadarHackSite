#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo bash deploy/bootstrap.sh"
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl git openssl ufw
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p storage backups
chmod 700 storage backups

if [[ ! -f .env.production ]]; then
  cp deploy/.env.production.example .env.production
  auth_secret=$(openssl rand -hex 48)
  radar_secret=$(openssl rand -hex 48)
  sed -i "s/AUTH_SECRET=generate-a-long-random-value/AUTH_SECRET=$auth_secret/" .env.production
  sed -i "s/RADAR_INGEST_SECRET=generate-another-long-random-value/RADAR_INGEST_SECRET=$radar_secret/" .env.production
  chmod 600 .env.production
  echo "Created .env.production with random secrets. Set DOMAIN and the public URLs, then rerun this script."
  exit 0
fi

if grep -qE '^(DOMAIN|NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_RADAR_WS_URL)=.*(radar\.example\.com|203\.0\.113\.10)' .env.production; then
  echo "Edit .env.production and replace the example domain or IP address first."
  exit 1
fi

if grep -qE '^(AUTH_SECRET|RADAR_INGEST_SECRET)=generate-' .env.production; then
  echo "Generate real AUTH_SECRET and RADAR_INGEST_SECRET values first."
  exit 1
fi

if grep -qE '^DOMAIN=https?://[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' .env.production; then
  echo "IP-only mode detected: serving plain HTTP without a TLS certificate."
fi

docker compose --env-file .env.production config >/dev/null
docker compose --env-file .env.production up -d --build

echo "Deployment started. Check: docker compose --env-file .env.production ps"
