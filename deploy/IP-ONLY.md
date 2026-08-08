# Deploy without a domain

Use this mode for temporary testing by public VPS IPv4 address. Traffic is plain HTTP/WS, so switch to a domain and HTTPS before a public production launch.

## Configure

Run the normal bootstrap once, then replace `.env.production` with the IP template:

```bash
cp deploy/.env.ip.example .env.production
nano .env.production
```

Replace every occurrence of `203.0.113.10` with the public IPv4 address of the VPS. Generate independent secrets:

```bash
sed -i "s/generate-a-long-random-value/$(openssl rand -hex 48)/" .env.production
sed -i "s/generate-another-long-random-value/$(openssl rand -hex 48)/" .env.production
chmod 600 .env.production
```

The important values are:

```dotenv
DOMAIN=http://YOUR_VPS_IP
NEXT_PUBLIC_APP_URL=http://YOUR_VPS_IP
NEXT_PUBLIC_RADAR_WS_URL=ws://YOUR_VPS_IP
COOKIE_SECURE=false
```

Start the stack:

```bash
sudo bash deploy/bootstrap.sh
```

Open:

```text
http://YOUR_VPS_IP
http://YOUR_VPS_IP/launcher
```

Set the native launcher's `launcher-config.json` to the same address:

```json
{
  "appUrl": "http://YOUR_VPS_IP"
}
```

## Later migration to a domain

After adding an A record, change the values to `https://your-domain` and `wss://your-domain`, set `COOKIE_SECURE=true`, then rebuild:

```bash
sudo docker compose --env-file .env.production up -d --build
```

Caddy will obtain and renew the certificate automatically.
