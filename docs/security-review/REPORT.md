# SturdiHome initial security review — September 19, 2026

**Historical report. Superseded by [FINAL-REPORT.md](FINAL-REPORT.md) and
[HUMAN-IT-CHECKLIST.md](HUMAN-IT-CHECKLIST.md). The unresolved items and deployment
requirements below describe the initial review, not the current local code.**

Status: security changes saved locally only. No deployment, production testing,
production data changes, pricing changes, role changes, redesign, or welcome
animation changes were made during this review.

## Checks that passed

- Protected pages re-check database-backed authentication and role authorization.
  Proxy is an early redirect layer, not the only security boundary.
- Admin pages and actions require the stored ADMIN role. Registration actions
  assign their own fixed roles and do not trust submitted role values.
- Signed session cookies are HTTP-only, SameSite=Lax, and Secure in production.
  Sessions expire and are revoked on logout. Database role changes invalidate
  existing sessions. Password resets revoke all sessions for that account.
- Private document downloads require ownership or admin; business lead/referral
  reads and updates are scoped to the assigned partner. Appointment requests
  verify homeowner ownership. Marketplace edits use the session owner ID.
- Vendor approval and finance-partner approval checks exist on their protected
  pages and mutation actions. Active vendor membership and paid partner onboarding
  restrict lead/referral access. Admin assignment now also verifies eligibility.
- Passwords use bcrypt with cost 10; reset tokens are random, hashed at rest,
  short-lived, and transactionally single-use. No plain-text password storage
  was found in application code. Test fixture passwords are synthetic only.
- Prisma parameterized application queries are used; no application raw SQL
  accepting visitor input was found. React text rendering escapes submitted text.
- Next.js Server Actions retain their same-origin protection; no broad
  allowedOrigins exception was introduced.
- No tracked .env files were found, including the filename history check. No
  configured secret values were found in tracked text source or the browser
  bundles inspected. This is a bounded scan, not a forensic guarantee about
  every historical commit, external log, or third-party system.

## Weaknesses found and changes made

| Finding | Local change |
| --- | --- |
| Unrestricted file uploads | Enforce PDF/PNG/JPEG/WebP extension, MIME and signature checks; 4 MiB file cap; 20 uploads per account per 15 minutes; bounded names and contained storage paths |
| Potentially active uploaded content served inline | Force downloads, no-sniff and sandbox headers; retain private no-store responses and ownership checks |
| Registration abuse | Shared database throttles across all three registration actions: 10/IP and 5/email per 15 minutes |
| Unbounded form fields and bcrypt truncation | Bound identity and request fields; reject new/reset passwords exceeding bcrypt's 72-byte UTF-8 limit; retain compatibility for existing logins |
| Chat payload validation and instance-local limits | Bound actual request bytes, messages, parts and text; reject system/tool roles and attachments; account-based shared rate limit and cross-origin rejection |
| Pending partners could use marketplace/chat | Enforce stored partner approval for those service entry points |
| Sensitive action abuse | Added limits to upload, service requests, billing, profile updates and reset consumption; existing login and reset-request throttles retained |
| Detailed Stripe signature errors | Generic error response; no provider exception details returned |
| Financing payment status trusted completion alone | Require paid status; process delayed successful payments through the corresponding Stripe event |
| Missing browser defenses | Add no-sniff, frame denial, restrictive framing/object/base CSP, and referrer policy |
| Critical dependency advisories | Next.js 16.3.1 → 16.3.5, matching eslint config; sharp now 0.35.4 |

Upload signature validation is not malware scanning or full file decoding. A file
with a valid header can still contain malicious data. Attachment delivery reduces
browser execution risk but does not make the downloaded file intrinsically safe.

## Still requires configuration or a decision

1. **Homeowner approval policy:** there is no homeowner admin-approval state or
   approval workflow in the existing schema. The agreement step exists, but was
   not enforced as a universal service gate. The owner was asked whether agreement,
   admin approval, or active paid membership is required. No new business rule or
   schema was silently introduced. This part of the requested approval guarantee
   remains unresolved until that decision is supplied.
2. **Private durable file storage:** Vercel /tmp uploads are temporary and can be
   unavailable across instances. Configure private object storage, short-lived
   authorized downloads, retention, backup, and malware scanning. Existing uploaded
   records were not deleted or migrated.
3. **Password-reset email:** configure a verified email sender and provider; current
   recovery delivery remains unavailable. No email was sent during testing.
4. **Remaining dependency advisory:** final production audit reports 0 critical and
   3 high package entries, all from the same deepmerge-ts recursive-graph stack
   exhaustion issue through @prisma/config → prisma. It is a Prisma tooling path;
   no visitor-controlled recursive config path was found. The suggested automated
   fix is a Prisma downgrade, so it was not forced. Upgrade/override only after
   Prisma compatibility and generation/migration checks.
5. **Admin MFA and email verification:** not implemented by this review. Recommended
   follow-up for privileged accounts and registration abuse resistance.
6. **Operational defenses:** configure edge/WAF limits, trusted proxy IP handling,
   alerting, audit logging, backup/restore checks, and credential rotation if past
   disclosure is suspected. IP-based limits depend on trustworthy proxy headers;
   authenticated limits use stable account IDs. Contact is currently a mailto link,
   not a server contact-submission endpoint.
7. **Additional review:** durable Stripe event deduplication/order handling and
   concurrent founding-vendor reservations deserve separate payment regression
   coverage. No real Stripe transactions were performed.

## Tests and results

All tests used localhost and synthetic accounts in an isolated in-memory database.
No destructive or mutation tests were run against production.

- 9 unit/regression tests passed: redirect allowlisting, role policy, welcome copy,
  marketplace validation, upload rejection/acceptance, chat payload validation and
  JWT tampering.
- Existing browser suite: 16 grouped checks passed, including all 28 protected
  page URLs, logout cookie replay, cross-role access, first and returning login,
  password reset consumption/reuse/session revocation, and direct server-action
  replay without authentication.
- Additional membership suite: 6 grouped checks passed, including first-time vendor
  and finance-partner approval gates, admin access, public chat gate and mobile UI.
- New targeted suite: 9 grouped checks passed for private-record isolation, forged
  admin cookie rejection, malformed and cross-origin chat, executable upload
  rejection, live database role-change invalidation, both pending-partner paths,
  browser headers, and invalid Stripe signatures. Results: browser-results.json.
- Additional abuse/entitlement checks passed: registration throttling prevents
  account creation; inactive vendors and unpaid finance partners cannot read
  restricted lead/referral data.
- TypeScript, ESLint, and the Next.js 16.3.5 production build passed. No real
  AI requests, payment charges or password-reset emails were used.

Reproduction scripts: `tests/membership/security-browser.mjs`,
`tests/membership/security-limits.mjs`, existing membership suites, and
`src/lib/security.test.ts`. The local test-control database endpoint must remain
loopback-only and must never be published.

## Potential live-site effects if approved

- No additional schema migration is required for these security changes.
- Unsupported, mislabeled or oversized uploads will be rejected. Flyers will
  download instead of displaying inline. The server-action body limit is 4.2 MB
  to accommodate the 4 MiB file plus multipart metadata.
- Pending partners lose marketplace/chat access until approved, while their
  application-status page remains available. Rate limits can temporarily block
  unusually frequent legitimate requests or shared-IP registrations.
- New/reset passwords over 72 UTF-8 bytes are rejected; existing hashes are not
  rewritten. Pricing, account types, welcome symbols and timings are untouched.
- Embedding this site in an iframe will be blocked. Full script-src CSP was not
  added without a compatibility rollout; the present CSP is deliberately limited.
- Patched Next.js/sharp and delayed-payment webhook handling need normal staging
  regression testing before production approval.

Awaiting owner approval before deployment. The current live site does not yet
contain these hardening changes or dependency patches.
