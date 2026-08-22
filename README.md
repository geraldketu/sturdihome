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

## User flows

- **Homeowner/Member:** `/signup` → `/member/membership` (mock payment/activation) →
  `/member/agreement` → `/member/documents` → `/member` dashboard → financing/service
  requests → appointments
- **Vendor:** `/apply/vendor` → `/pending-approval` → admin approval at
  `/admin/vendors` → `/vendor` dashboard → `/vendor/leads`
- **Financing Partner:** `/apply/financing` → `/pending-approval` → admin approval at
  `/admin/financing-partners` → `/financing` dashboard → `/financing/referrals`

Admin (`/admin`) can see and manage all members, vendors, financing partners,
applications, and assign homeowner requests to approved vendors/financing partners.
There's no signup form for admins by design; seed additional ones via
`prisma/seed.ts` or promote a user's `role` to `ADMIN` directly in the database.

## Access control

`src/proxy.ts` gates everything under `/member`, `/vendor`, `/financing`, and `/admin`
by role, redirecting unauthenticated requests to `/login` and cross-role requests to
the visitor's own dashboard. Layouts under those route groups (e.g.
`src/app/vendor/layout.tsx`) re-check current DB state, so a vendor whose application
is later rejected, or a member whose membership lapses, loses page-level access
immediately, without needing a new token.

## Environment variables

| Variable                | Used for                                                |
| ------------------------ | -------------------------------------------------------- |
| `DATABASE_URL`           | Pooled Postgres connection, used by the app at runtime  |
| `DATABASE_URL_UNPOOLED`  | Direct connection, used by Prisma CLI for schema pushes |
| `JWT_SECRET`             | Signs/verifies the session cookie (`src/lib/jwt.ts`)    |

All three are set on the Vercel project (Production, Preview, and Development) and
can be pulled locally with `npx vercel env pull`.

## Known limitations (prototype)

- Payment is simulated: `/member/membership` just flips membership status/billing
  dates; no real payment processor is wired up.
- Uploaded documents (`src/lib/uploads.ts`) are written to local disk in development,
  but to Vercel's ephemeral `/tmp` in production, so they do not persist across
  deployments or cold starts. The database (Postgres/Neon) is persistent; file
  storage is not yet.

## Running locally

**Prerequisites:** Node.js 20+, npm, and a PostgreSQL connection string.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) and `JWT_SECRET` in a `.env` file
   at the project root. If you have access to the Vercel project, pull the real
   values instead of making up your own:

   ```bash
   npx vercel link      # first time only, links this folder to the Vercel project
   npx vercel env pull  # writes .env.local with DATABASE_URL, JWT_SECRET, etc.
   ```

3. Sync the schema and seed the admin account:

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

**Admin login:** `admin@sturdihome.com` / `Admin123!`

**Browsing the database:** `npx prisma studio` opens a GUI at http://localhost:5555
against whichever `DATABASE_URL` is set.

## Deployment

Live at [https://sturdihome.vercel.app/](https://sturdihome.vercel.app/). The
`master` branch on GitHub is connected to the Vercel project, so pushes to `master`
auto-deploy to production.

