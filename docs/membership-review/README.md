# Membership and login update — local review

The live site and production database have not been changed. Existing branding,
prices, service categories, dashboard welcomes, forms, Sturdi Guy artwork, and
authenticated chat/voice controls are preserved.

## Access policy

| Area | Access |
| --- | --- |
| Homepage, service descriptions, how it works, joining, applications | Public |
| Homepage business previews | Public marketing fields only; no website/contact/account details |
| Vendor search, financing directory, individual profiles | Authenticated network accounts |
| Member tools | Homeowner; existing explicit admin access preserved |
| Vendor tools | Approved vendor; existing membership requirements preserved |
| Finance-partner tools | Approved finance partner; existing payment requirements preserved |
| Admin pages/actions | Admin only |
| Documents and flyers | Appropriate role plus ownership, or admin |
| AI chat API | Authenticated; public Sturdi Guy launcher offers Join/Sign In |
| Stripe webhook | Existing signature verification retained; not a browser membership endpoint |

Proxy provides early redirects, while database session checks run in protected
pages, directory queries, APIs, and server actions. Logout revokes the database
session; replaying its cookie fails. Changed roles invalidate old sessions.
Internal return URLs retain service/category/location and are validated against
the assigned role. No role is granted by a URL, form field or welcome screen.

## Welcome behavior

A new login gets one personalized welcome with gentle gold hearts, a short
automatic transition and an immediate Continue button. Reduced-motion users get
no floating animation. Existing dashboard welcome sections remain.
Newly created users receive the first-time message. Subsequent sessions receive
Welcome Back. The display is acknowledged in the database, and the client also
suppresses cached history replays. The welcome is replaced in browser history
when continuing.

## Before production rollout

1. Apply `prisma/membership-access.sql` once to the intended database before the
   updated application starts. It adds sessions, password-reset tokens, login
   tracking and shared authentication throttles; it does not remove existing data.
2. Existing accounts did not have reliable login history. The migration marks
   those accounts as returning; accounts created afterward have exact first-login
   tracking. Previous stateless sessions will require a fresh sign-in.
3. Password-reset delivery needs `RESEND_API_KEY`, `PASSWORD_RESET_FROM` (a
   verified sender), and `APP_BASE_URL` (the canonical HTTPS site URL). The
   isolated adapter follows the [official Resend email API](https://resend.com/docs/api-reference/emails/send-email).
   If another provider is preferred, replace only `src/lib/reset-email.ts`.
   No provider account was created, no email was sent, and no key was added.
4. Review locally before authorizing a production migration or deployment.

Reset links use random 256-bit tokens, stored only as SHA-256 hashes, expire
after 30 minutes, and are consumed transactionally. A reset invalidates all
sessions and other reset links for that account. Request responses do not reveal
whether an email is registered. Database-backed login/reset throttles work
across application instances. Email delivery is **not verified** until a provider
and sender are configured; the UI reports unavailable delivery if unconfigured.

## Validation

- TypeScript, ESLint, unit tests and production build pass.
- Browser/API checks use synthetic accounts and an isolated in-memory database.
- All 28 protected page routes reject logged-out direct URL access.
- Public pages stay public; all rendered service-category links are gated.
- All three roles, their first/returning welcomes, approval gates, cross-role
  restrictions, logout, old-cookie replay and selected-service returns are checked.
- Password-reset consumption, reuse rejection, session revocation and new-password
  login are checked without sending mail.
- Phone layouts at 320/390px, tablet at 768px and desktop at 1280px are checked.
- Production-mode result details and screenshots are saved alongside this file.
- No AI generations, paid chat calls, Stripe transactions, real account edits or
  production database operations were used in testing.

## Reproduce locally

Test tools are isolated from production dependencies:

```powershell
npm install --prefix node_modules/.cache/membership-tools --no-audit --no-fund playwright pglite-server @electric-sql/pglite
node node_modules/prisma/build/index.js generate
node node_modules/prisma/build/index.js migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script --output node_modules/.cache/membership-tools/schema.sql
node tests/membership/database.mjs
```

In a separate terminal, override the database settings before starting the app:

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:55439/postgres?connection_limit=1'
$env:DATABASE_URL_UNPOOLED=$env:DATABASE_URL
$env:JWT_SECRET='local-membership-review-only-secret-2026'
$env:APP_BASE_URL='http://127.0.0.1:3000'
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Or run `npm run build` then `npm run start -- --hostname 127.0.0.1 --port 3000`
with those same environment overrides. Do not run dev and production servers
against this single-connection test database simultaneously.

```powershell
node --import tsx --test src/lib/access.test.ts src/lib/marketplace-shared.test.ts
node tests/membership/browser.mjs
node tests/membership/extra-browser.mjs
node tests/membership/back-check.mjs
```

The scripts use installed Chrome at its standard Windows path. The test database
and its test-control endpoint bind to loopback ports 55439 and 55440 only; never
expose them publicly. Stopping the database discards its synthetic data.

For manual local review, sign in at http://127.0.0.1:3000/login with
`test-member@example.test`, `test-vendor@example.test` or
`test-finance@example.test`. All use `Review-only-Password42`. These are synthetic
local accounts, not live-site credentials. Create another local account to see
the first-time welcome.
