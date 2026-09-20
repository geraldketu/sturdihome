# SturdiHome final local security review

Date: September 19, 2026. Status: **local code fixes and local tests completed;
not deployed, and not yet operationally ready for production.**

No production database was migrated, no live data was changed, and no real email,
payment, AI-generation or storage service was used by the tests. Existing users,
records, pricing, account types, welcome animations and Sturdi Guy were preserved.
This report supersedes the initial REPORT.md.

## Completed security work

### Agreements and manual approval

- Added database-backed approval status, reviewer identity and review timestamp
  for every non-admin account, plus versioned agreements, acceptance records and
  an approval/revocation audit trail.
- All three roles require both acceptance of their current active agreement and
  manual admin approval. Partner profile approval remains an additional check.
  Payment or a historical profile status does not grant network approval.
- Enforced the same policy in server-rendered protected pages, mutation actions,
  chat, billing and document/flyer downloads. Browser role values cannot grant
  privileges. The proxy is not the only security boundary.
- Added an agreement screen and admin approval/revocation controls on account
  detail pages. The welcome animation runs unchanged before the required gate.
- Reused the existing homeowner agreement text exactly. **No Vendor or Finance
  Partner agreement was invented or added to the application migration. Those
  roles remain blocked until approved terms are provided, accepted, and followed
  by manual admin approval.** Synthetic partner terms exist only in test fixtures.
- Missing agreement records, changed versions, missing acceptance audit records,
  pending/rejected approval, and revocation all deny restricted access. Repeated
  acceptance cannot erase a completed review. New-version acceptance resets the
  account for manual review.
- Partner directory listings, previews, selection lists and assignment eligibility
  now honor current agreement and approval state as well.

### Password reset email

- Prepared Resend delivery with server-only credentials, a fixed configured base
  URL, HTTPS checks, a bounded timeout, and no redirect-following by the provider
  request. A loopback-only test adapter is disabled in production.
- Missing configuration reports recovery temporarily unavailable. Known and
  unknown addresses otherwise get the same response. Delivery failure removes
  the unusable reset token and logs a generic operational message.
- Tokens are cryptographically random, stored as hashes, expire after 30 minutes,
  and are consumed transactionally once. Successful resets revoke every session
  and outstanding reset token for the account. Existing rate limits remain.
- Local tests exercised actual request → synthetic email → reset-link submission
  → new-password login, including failure cleanup and old-cookie rejection.

### Private durable files

- New documents and flyers write to private S3 object storage, not a local folder
  or Vercel's ephemeral /tmp. Database records keep opaque storage references;
  object URLs and credentials are not sent to the browser.
- Uploads retain the 4 MiB limit and PDF/PNG/JPEG/WebP extension, MIME and signature
  validation, plus account rate limits. Every new file must receive a clean verdict
  from the configured authenticated scanner before storage. Missing, failing or
  rejecting scanners block the upload.
- Before reads and writes, the adapter verifies all four bucket public-access
  blocks. It requests AES256 server-side encryption for stored files. The selected
  provider must support these APIs; generic S3 compatibility alone is insufficient.
- Downloads still require current account approval and ownership or admin access.
  Responses are attachments with no-sniff, sandbox and private/no-store headers.
  Another owner's key cannot be used to read a file.
- Legacy file records were not deleted. Existing local files have a guarded,
  scan-before-download compatibility path. They still require a controlled copy
  to durable storage before rollout. Files already lost from an old ephemeral
  instance cannot be reconstructed from the database filename alone.

### Other hardening retained and verified

- Database-backed session expiration, role checks and logout revocation; signed
  HTTP-only cookies, SameSite and production Secure flags; bcrypt password hashing.
- Server-side private-record ownership checks, bounded form inputs, protected
  admin mutations and no user-controlled raw SQL found in application queries.
- Shared database throttles for registration, login, recovery and sensitive
  mutations; bounded chat requests and cross-origin rejection.
- Generic Stripe signature errors and paid-status checks; browser framing,
  no-sniff, object/base and referrer protections from the initial security pass.
- Patched Next.js/sharp and tested a deepmerge-ts 8.0.2 override with Prisma 6.19.3.
  Prisma generation, schema diff, migration rehearsal and build succeeded.
  Final `npm audit --omit=dev` reported **0 known vulnerabilities** in production
  dependencies. This is an advisory snapshot, not a guarantee against unknown bugs.

## Local verification results

All tests used loopback hosts, synthetic accounts and an isolated PGlite database.
No production mutation or destructive test was performed.

| Verification | Result |
| --- | --- |
| Unit/regression tests for roles, return URLs, welcome copy, marketplace inputs, uploads and JWT tampering | 9 passed |
| Missing/unsafe provider configuration and storage-path tests | 1 grouped test passed |
| Existing membership browser suite, including all 28 protected URLs, cross-role access, logout replay, password reset and direct unauthenticated action replay | 16 grouped checks passed |
| Signup/admin/mobile/search/chat/recovery browser suite | 6 grouped checks passed |
| Private-record isolation, forged admin cookie, chat validation/origin, unsafe uploads, live role changes, partner gates, headers and forged webhook | 9 grouped checks passed |
| Agreement, approval/revocation, missing partner terms, changed versions, private storage, scanner rejection and email-delivery round trip | 9 grouped checks passed |
| Forged admin approval without terms, replayed service mutation after revocation, and missing acceptance audit | 4 grouped checks passed |
| Registration throttling and unpaid/inactive partner restrictions | 3 checks passed |
| Unchanged role welcome symbols, timing, dimensions, transition and mobile fit | All 3 roles passed |
| Additive migration against old schema; legacy data retained; no partner terms or auto-approval; exact homeowner text; one active agreement per role | 5 grouped checks passed |
| Private-file bytes survive local provider restart; different owner key rejected | 2 checks passed |
| Prisma client generation, TypeScript, ESLint, optimized Next.js build | Passed |
| Configured secret-value scan of tracked source and 33 browser bundles | No matches; no tracked .env files |

Evidence files are in this directory: completion-results.json, bypass-results.json,
migration-results.json, storage-restart-results.json, browser-results.json and
secret-scan-results.json. Additional membership/welcome results are in
../membership-review/. Test scripts are in tests/membership/ and src/lib/*.test.ts.
Some Windows test runners initially hit sandbox process restrictions; their
authorized local reruns passed. No failing application test remains outstanding.

The local provider adapters validate application behavior; they do **not** prove
real inbox delivery, cloud IAM configuration, cloud disaster recovery, or the
effectiveness of an actual malware engine. The secret scan is bounded to current
configured values and inspected files, not an exhaustive historical forensic scan.

## Required human / IT setup before deployment

These are outstanding operational dependencies, not silently completed items:

1. Supply the approved Vendor and Finance Partner agreements. Until then, keep
   both roles blocked. Review the preserved homeowner terms with the owner/legal
   adviser if marketplace wording should change; no contract language was rewritten.
2. Set up Resend, verify the sending domain, and configure the sender, API key and
   canonical HTTPS application URL. Real inbox delivery is not verified yet.
3. Provision the private S3 bucket, least-privilege credentials, encryption, public
   access blocks, backup/retention and an authenticated malware-scanning service.
   None of these provider credentials are currently configured in the local env
   files inspected. Uploads fail closed until configuration is complete.
4. Inventory and migrate recoverable legacy files with byte/hash verification,
   retaining originals and database records until the copy is proven.
5. Back up and rehearse the additive migration on staging, confirm admin access,
   and plan the required manual review of existing accounts.
6. Obtain the owner's separate deployment approval. **Nothing in this report
   authorizes deployment or production changes.**

See HUMAN-IT-CHECKLIST.md for the ordered setup and acceptance checklist.

## What could affect the live site after an approved rollout

- The new schema must be applied before this code runs. It adds fields/tables;
  it does not drop data. Existing non-admin accounts default to PENDING and must
  complete versioned acceptance and manual review. No historical accounts are
  automatically grandfathered into approval.
- Vendors and financing partners will remain restricted while their agreements
  are unavailable, including checkout entry points. Existing subscriptions are
  not canceled and pricing is unchanged; coordinate member communications.
- Private uploads need working storage and scanning; otherwise they are rejected.
  Previously stored ephemeral files require recovery/migration. Downloads use
  attachment behavior and the existing file-size/type restrictions remain.
- Email recovery needs verified delivery configuration. Provider outages will
  prevent recovery emails; session and password data remain protected.
- Existing security headers, rate limits and dependency patches retain the
  compatibility considerations noted in the initial review. No redesign is included.

## Recommended subsequent security work

Admin MFA, email-address verification, edge/WAF abuse controls, verified proxy IP
handling, security alerting and periodic backup-restore drills remain recommended
operational improvements. They were not represented as implemented by this task.
Payment-specific event deduplication/order handling and concurrent founding-vendor
reservation testing still deserve a separate Stripe test-mode regression pass;
no real checkout was performed or paid plan logic redesigned here.

This is a bounded application review, not a penetration-test certification.
Local implementation is ready for owner/IT review; production readiness remains
conditional on the setup checklist and separate deployment approval.
