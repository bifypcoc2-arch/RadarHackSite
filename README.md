# Web Radar

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

- Email: `demo@webradar.dev`
- Password: `radar-demo-2026`

## Stripe

Create two one-time Stripe Prices and fill `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_LIFETIME_PRICE_ID` in `.env`. Forward Stripe webhooks to `/api/webhooks/stripe`. Never commit `.env`.

## Routes

- `/` — bilingual product landing
- `/pricing` — plans and Stripe Checkout
- `/login` — secure sign in
- `/dashboard` — protected customer control center

The launcher file in `public/launcher-placeholder.txt` is intentionally a placeholder for a signed production binary.
