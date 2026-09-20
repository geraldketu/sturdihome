# SturdiHome human / IT setup checklist

**Do not deploy, apply production SQL or alter live accounts until the owner
separately approves rollout. Keep all credentials in the hosting provider's
server-side secret settings; do not paste them in chat or commit them.**

## Owner / authorized administrator

- [ ] Provide final approved Vendor and Finance Partner agreements, each with a
  unique version, title and exact approved text. Until supplied, leave their
  active agreement records absent. Do not approve around this restriction.
- [ ] Confirm the preserved homeowner agreement remains the intended legal text.
  Existing wording was reused unchanged, not newly authored or legally reviewed.
- [ ] Identify the authorized admins and the manual acceptance/approval criteria.
  Agree who checks requests and how members receive status/support assistance.
- [ ] Plan communications: all existing non-admin accounts will need versioned
  acceptance and manual approval. Partners stay blocked while terms are missing.
  Existing paid subscriptions are not automatically canceled by these changes.
- [ ] Approve staging verification, then separately approve production deployment.

## IT: database and agreements

- [ ] Back up the current database and verify restoration to a separate staging
  database. Inventory table/record counts before changing anything.
- [ ] Review `prisma/security-approval-additive.sql`. It assumes the existing
  membership schema, runs once in a transaction, and preserves legacy data.
  Apply to staging first. Never use `prisma migrate reset` or `db push --force-reset`.
- [ ] Verify the current DB-backed ADMIN account can still sign in. Admins bypass
  the member-agreement gate; no public registration action can create an admin.
- [ ] Preserve the partial unique index allowing only one active agreement per
  role. It is in the SQL migration; do not remove it during future schema tooling.
- [ ] When approved partner text is supplied, publish it through a controlled IT
  transaction: insert a new role/version/title/content record, deactivate any
  prior active version, then activate the approved version. Never overwrite old
  accepted text or reuse its version. No placeholder or synthetic text in staging
  signoff or production. Keep historical acceptance/audit records.
- [ ] Users accept through `/agreement`; admins then review each account at its
  existing Admin detail page and choose **Approve Account**. Do not mass-edit
  approval flags or treat subscription payment as manual approval.
- [ ] Test rejection/revocation with an already-open session and verify the next
  protected request is denied. Verify missing terms cannot be bypassed via POST.
- [ ] Use a restricted application DB principal. Schema administration should use
  separate credentials; protect backups and audit access at the database layer.

## IT: password reset email

- [ ] Create/select Resend, verify the sending domain and its DNS records, and
  confirm the sending address is authorized. Follow the official
  [Resend domain guide](https://resend.com/docs/dashboard/domains/introduction).
- [ ] Configure server-only `RESEND_API_KEY`, `PASSWORD_RESET_FROM`, and
  `APP_BASE_URL` (the exact canonical HTTPS SturdiHome origin, not a value from a
  visitor request). Do not set `LOCAL_RESET_EMAIL_ENDPOINT` in hosting.
- [ ] Send controlled staging reset emails to an inbox IT owns. Verify sender,
  delivery/spam placement, correct HTTPS link and expiry. Test single use, old
  session rejection, unknown-address response and provider-failure cleanup.
- [ ] Confirm production email delivery only as part of the separately approved
  rollout. Monitor delivery failures/bounces without recording passwords or reset
  URLs/tokens. Redact reset query strings from analytics/access logs where needed.

## IT: private durable storage and scanning

- [ ] Provision a dedicated private AWS S3 bucket, or a provider verified to support
  GetPublicAccessBlock with all four flags plus AES256 object encryption. R2 or
  another service is not automatically compatible with this enforcement.
- [ ] Enable BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy and
  RestrictPublicBuckets. Disable public website hosting and public ACL/policy
  grants. See [AWS Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html).
- [ ] Enable encryption, versioning, private backup/retention and access logging.
  Scope the app credential to `s3:GetBucketPublicAccessBlock` on this bucket and
  `s3:GetObject`/`s3:PutObject` on `private/*`. No public-access-policy or ACL update
  permissions; no bucket-delete or broad account permissions. Use separate IT
  credentials for approved migration/retention operations.
- [ ] Configure server-only `PRIVATE_S3_BUCKET`, `PRIVATE_S3_REGION`,
  `PRIVATE_S3_ACCESS_KEY_ID`, `PRIVATE_S3_SECRET_ACCESS_KEY`. For a compatible custom
  provider, also configure `PRIVATE_S3_ENDPOINT` using HTTPS. AWS's standard
  endpoint does not need that variable. These are never NEXT_PUBLIC variables.
- [ ] Provision an actual malware scanning service and configure `UPLOAD_SCAN_URL`
  and `UPLOAD_SCAN_TOKEN`. Contract: authenticated HTTPS POST, Bearer token,
  application/octet-stream bytes, at most 4 MiB; return HTTP success with JSON
  `{ "clean": true }` **only after a complete successful scan**. Infected files,
  timeouts or scanner errors must not return a clean result. Keep signatures
  current, restrict access and avoid retaining private documents unnecessarily.
- [ ] Do not point production at `tests/membership/providers.mjs`: it is a
  synthetic test stub, not an antivirus engine. Verify a safe test file, standard
  antivirus test fixture and scanner outage in an isolated staging environment.
- [ ] Verify upload → authorized download returns identical bytes; anonymous,
  other-account and unapproved-account requests fail. Verify anonymous direct
  bucket/object requests fail. Restart/redeploy staging and confirm files persist.
- [ ] Inventory legacy Document/VendorFlyer filenames and recoverable files from
  local/old hosts. Copy through validation/scanning into the correct owner prefix,
  compare byte counts and hashes, then update each record to `s3:<stored-name>`.
  Keep originals and a mapping manifest until verified; do not delete records for
  missing files. Re-upload unrecoverable files with the owner's help.
- [ ] Rehearse restore from backup/version history. Record retention and private
  document deletion rules appropriate to the business and its obligations.

## IT: final release checks — after separate authorization

- [ ] Staging has its own DB, email, payment-test, storage and scan configuration.
  Never publish the loopback test database/control server or synthetic providers.
- [ ] Run local tests, lint, type check, Prisma generation and build using the
  lockfile (`npm ci`), retaining the tested deepmerge-ts override until a verified
  Prisma update replaces it. Re-run dependency audit at release time.
- [ ] Verify homeowner, vendor, finance partner and admin roles; agreements;
  approval/revocation; cross-account files; session logout; email reset; billing
  restrictions; mobile layouts and the unchanged welcome animations/Sturdi Guy.
- [ ] Recheck current production environment settings without printing secrets.
  Ensure `JWT_SECRET` is strong and unique; Secure cookies require HTTPS.
- [ ] Review the live-access impact with the owner and prepare a support window.
  Back up first, apply the additive schema before the code, and verify admin access
  before inviting users to complete agreements. Do not roll back to insecure gates
  merely to restore access; use an approved recovery plan and preserve new audits.
- [ ] Obtain and record the owner's deployment approval. Nothing has been deployed
  by this task, and no migration has been applied to production.

## Recommended follow-up

- [ ] Add admin MFA and email verification with a recovery plan.
- [ ] Configure WAF/edge rate limits, trusted proxy IP handling and security alerts.
- [ ] Rehearse backups periodically; restrict staff access and rotate credentials
  if exposure is suspected. Schedule dependency/advisory reviews.
- [ ] Run a separate Stripe test-mode review for webhook duplicates/order and
  concurrent founding-vendor reservations before changing payment mechanics.
