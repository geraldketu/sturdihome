# Reproduce the security checks locally

Do not run these synthetic fixtures on a public host. They intentionally contain
test-only partner terms and a loopback SQL-control endpoint. Do not point them at
production or reuse real credentials. Use the current report/checklist instead
of the older membership review's setup instructions.

Install the isolated tools and generate SQL without connecting to any database:

```powershell
npm install --prefix node_modules/.cache/membership-tools --no-audit --no-fund playwright@1.63.0 pglite-server@0.1.5 @electric-sql/pglite@0.5.8
npx prisma generate
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script --output node_modules/.cache/membership-tools/schema.sql
```

Start these in three separate local terminals:

```powershell
node tests/membership/database.mjs
node tests/membership/providers.mjs
node tests/membership/start-security-app.mjs
```

The last script explicitly overrides the DB, email, storage, scanning, Stripe and
AI settings with synthetic values. Ports are 3000 and 55439–55441 on loopback.
The test adapter captures mail locally and simulates scanning; it never sends
mail and is not a real malware engine. The object fixture writes only to the
ignored node_modules/.cache/security-storage folder.

Run these sequentially while the local services are running:

```powershell
node --conditions=react-server --import tsx --test src/lib/access.test.ts src/lib/marketplace-shared.test.ts src/lib/security.test.ts src/lib/providers.test.ts
node tests/membership/security-browser.mjs
node tests/membership/security-completion.mjs
node tests/membership/security-bypass.mjs
node tests/membership/browser.mjs
node tests/membership/extra-browser.mjs
node tests/membership/security-limits.mjs
node tests/membership/symbols.mjs
node --conditions=react-server --import tsx tests/membership/storage-restart.ts
npx tsc --noEmit
npm run lint
npm run build
npm audit --omit=dev
```

The restart test uses another loopback-only provider on port 55442 and stops it
after verifying persisted bytes. Browser tests use Chrome's standard Windows
installation path. Stop both the app and DB before regenerating Prisma or
restarting the single-connection test DB.

The migration rehearsal also uses an in-memory database. This workspace retains
the captured pre-change schema at node_modules/.cache/security-before.prisma.
Generate its SQL, then run:

```powershell
npx prisma migrate diff --from-empty --to-schema-datamodel node_modules/.cache/security-before.prisma --script --output node_modules/.cache/security-before.sql
node tests/membership/migration-check.mjs
```

For another checkout, obtain the actual pre-change schema from its reviewed
baseline rather than using a production database URL. The migration test inserts
synthetic legacy records and verifies preservation, fail-closed defaults, exact
existing homeowner terms and the one-active-agreement index. It never applies
the migration to a configured application database.
