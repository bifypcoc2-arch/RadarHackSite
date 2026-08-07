# Foresight

Premium bilingual product website and protected customer dashboard built with Next.js 16 App Router, TypeScript, pure CSS, Prisma/SQLite, `jose`, `bcryptjs` and Stripe Checkout.

## Start locally

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Demo credentials:

- Email: `demo@foresight.gg`
- Password: `foresight-demo-2026`

## Automatic radar sessions

When a player joins the private game server, the server plugin creates a dedicated radar URL:

```text
/radar/{username}/{random-session-id}
```

Example:

```text
/radar/KITE/F8K2P7Q4
```

Set a separate secret in `.env`:

```text
RADAR_INGEST_SECRET="a-long-random-server-secret"
```

Create a session when the player joins:

```bash
curl -X POST http://localhost:3000/api/radar/sessions \
  -H "content-type: application/json" \
  -H "x-radar-secret: $RADAR_INGEST_SECRET" \
  -d '{"username":"KITE","steamId":"7656119...","map":"de_cache","serverId":"private-01"}'
```

The response contains the unique `url` and `sessionId`. Send match snapshots to `PATCH /api/radar/sessions/{sessionId}` and close the session with `DELETE /api/radar/sessions/{sessionId}` using the same secret header.

`/demo/{username}` remains a standalone visual test and does not represent a live game session.

## Stripe

Create two one-time Stripe Prices and fill `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_LIFETIME_PRICE_ID` in `.env`. Forward Stripe webhooks to `/api/webhooks/stripe`. Never commit `.env`.

## Routes

- `/` — Foresight product landing with animated Cache radar
- `/demo` — test mode without a connected server
- `/radar/{username}/{sessionId}` — automatically generated live radar session
- `/pricing` — plans and Stripe Checkout
- `/login` — secure sign in
- `/dashboard` — protected Foresight control center

The launcher file in `public/launcher-placeholder.txt` is intentionally a placeholder for a signed production binary.
