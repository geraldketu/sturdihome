# SturdiHome Network

A working prototype implementing the SturdiHome IT/flow completion scope: separate
authenticated flows for homeowners (members), vendors, and financing partners, plus an
admin console, all with route-level access control.

SturdiHome Network LLC is a **referral network**, not a lender or contractor. The app
connects homeowners with independent financing partners and home-service vendors; it
never presents itself as the lender or the company doing the work.

## Stack

- Next.js 16 (App Router, Server Actions)
- Prisma + SQLite (`prisma/dev.db`, gitignored)
- Custom email/password auth: `bcryptjs` for hashing, `jose` (JWT) for sessions in an
  httpOnly cookie
- `src/proxy.ts` (Next's route-protection layer, formerly "middleware") enforces
  role-based access purely from the signed session cookie; pages additionally check
  live DB state (e.g. vendor approval status, membership status) since that can change
  after a session token is issued

## Getting started

```bash
npm install
npx prisma db push     # create the SQLite schema
npx prisma db seed     # create the admin account
npm run dev
```

Open http://localhost:3000.

**Seeded admin account:** `admin@sturdihome.com` / `Admin123!`

There's no signup form for admins by design: seed additional ones via
`prisma/seed.ts` or promote a user's `role` to `ADMIN` directly in the database.

## The three user flows

- **Homeowner/Member:** `/signup` → `/member/membership` (mock payment/activation) →
  `/member/agreement` → `/member/documents` → `/member` dashboard → financing/service
  requests → appointments
- **Vendor:** `/apply/vendor` → `/pending-approval` → admin approval at
  `/admin/vendors` → `/vendor` dashboard → `/vendor/leads`
- **Financing Partner:** `/apply/financing` → `/pending-approval` → admin approval at
  `/admin/financing-partners` → `/financing` dashboard → `/financing/referrals`

Admin (`/admin`) can see and manage all members, vendors, financing partners,
applications, and assign homeowner requests to approved vendors/financing partners.

## Access control

`src/proxy.ts` gates everything under `/member`, `/vendor`, `/financing`, and `/admin`
by role, redirecting unauthenticated requests to `/login` and cross-role requests to
the visitor's own dashboard. Layouts under those route groups (e.g.
`src/app/vendor/layout.tsx`) re-check current DB state, so a vendor whose application
is later rejected, or a member whose membership lapses, loses page-level access
immediately, without needing a new token.

## Notes on this being a prototype

- Payment is simulated (`/member/membership` just flips membership status/billing
  dates; no real payment processor is wired up).
- Uploaded documents are stored on local disk under `uploads/` (gitignored), served
  back only to their owner or an admin via `/api/documents/[id]`.
