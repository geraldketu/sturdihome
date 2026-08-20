# SturdiHome Network

A working prototype implementing the SturdiHome IT/flow completion scope: separate
authenticated flows for homeowners (members), vendors, and financing partners, plus an
admin console, all with route-level access control.

SturdiHome Network LLC is a **referral network**, not a lender or contractor. The app
connects homeowners with independent financing partners and home-service vendors; it
never presents itself as the lender or the company doing the work.

## Stack

- Next.js 16 (App Router, Server Actions)
- Prisma + PostgreSQL (Neon, connected via Vercel's storage integration)
- Custom email/password auth: `bcryptjs` for hashing, `jose` (JWT) for sessions in an
  httpOnly cookie
- `src/proxy.ts` (Next's route-protection layer, formerly "middleware") enforces
  role-based access purely from the signed session cookie; pages additionally check
  live DB state (e.g. vendor approval status, membership status) since that can change
  after a session token is issued

## Getting started

```bash
npm install
npx prisma db push     # sync the schema to your DATABASE_URL
npx prisma db seed     # create the admin account
npm run dev
```

Set `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) in `.env` to a PostgreSQL connection
string before running the commands above. `vercel env pull` fetches these from the
Neon database connected to the Vercel project.

Open http://localhost:3000, or the live deployment at
[https://sturdihome.vercel.app/](https://sturdihome.vercel.app/)

