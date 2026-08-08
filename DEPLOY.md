# Foresight VPS deployment

Production stack for Ubuntu 22.04/24.04:

- Next.js web application on the internal port `3000`
- realtime WebSocket gateway on the internal port `22006`
- Caddy reverse proxy with automatic HTTPS
- persistent SQLite database under `./storage`
- healthchecks, restart policies, backup and update scripts

Only ports `22`, `80` and `443` are exposed publicly.

## 1. DNS

Create an `A` record for your domain pointing to the VPS IPv4 address. Example:

```text
radar.example.com -> 203.0.113.10
```

Wait until the record resolves before starting Caddy.

## 2. Clone and bootstrap

```bash
sudo apt-get update
sudo apt-get install -y git
git clone https://github.com/bifypcoc2-arch/RadarHackSite.git
cd RadarHackSite
sudo bash deploy/bootstrap.sh
```

On the first run, the script installs Docker, configures UFW, creates persistent folders and generates two independent random secrets. It then exits so you can edit the production configuration.

## 3. Configure environment

```bash
sudo nano .env.production
```

At minimum replace:

```dotenv
DOMAIN=radar.example.com
ACME_EMAIL=admin@example.com
NEXT_PUBLIC_APP_URL=https://radar.example.com
NEXT_PUBLIC_RADAR_WS_URL=wss://radar.example.com
```

Add real Stripe values if payments are enabled. Keep `AUTH_SECRET` and `RADAR_INGEST_SECRET` private. The gateway and website must use the same `RADAR_INGEST_SECRET`.

## 4. Start

```bash
sudo bash deploy/bootstrap.sh
sudo docker compose --env-file .env.production ps
sudo docker compose --env-file .env.production logs -f --tail=100
```

Caddy requests and renews the TLS certificate automatically. Do not expose ports `3000` or `22006` in the VPS firewall.

## 5. Seed the optional demo account

Production does not seed demo credentials automatically. If you explicitly want them:

```bash
sudo docker compose --env-file .env.production exec web npm run db:seed
```

Demo credentials should not be enabled on a public paid deployment.

## 6. Realtime endpoints

Viewer:

```text
wss://radar.example.com/foresight/F8K2P7Q4?role=viewer
```

Authenticated private-server producer:

```text
wss://radar.example.com/foresight/F8K2P7Q4?role=producer&token=RADAR_INGEST_SECRET
```

Prefer the `x-radar-secret` or `Authorization: Bearer` header over a query-string token when the producer client supports custom headers.

## 7. Update

```bash
sudo bash deploy/update.sh
```

The update script creates a backup, pulls `main`, rebuilds changed containers and removes unused images.

## 8. Backup and restore

Manual backup:

```bash
sudo bash deploy/backup.sh
```

Archives are saved under `./backups` and retained for 14 days.

Restore during maintenance:

```bash
sudo docker compose --env-file .env.production down
sudo tar -xzf backups/foresight-YYYYMMDD-HHMMSS.tar.gz
sudo docker compose --env-file .env.production up -d
```

## 9. Useful commands

```bash
sudo docker compose --env-file .env.production ps
sudo docker compose --env-file .env.production logs -f web
sudo docker compose --env-file .env.production logs -f realtime
sudo docker compose --env-file .env.production logs -f caddy
curl -fsS https://radar.example.com/api/health
```

## 10. Native launcher

Place the production URL next to `Foresight.Launcher.exe` in `launcher-config.json`:

```json
{
  "appUrl": "https://radar.example.com"
}
```

Rebuild the launcher only when changing compiled code; changing the JSON file does not require rebuilding it.
