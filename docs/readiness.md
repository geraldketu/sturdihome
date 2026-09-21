# SturdiHome Readiness Notes

## Operational configuration still requiring owner/IT setup

- Resend verified sending domain, sender, `RESEND_API_KEY`, `PASSWORD_RESET_FROM`, and canonical HTTPS `APP_BASE_URL`.
- Private S3 storage with all public-access blocks, encryption, least-privilege IAM, versioning, backups, retention, and access logging.
- Authenticated malware scanner via `UPLOAD_SCAN_URL` and `UPLOAD_SCAN_TOKEN`.
- Trusted production proxy configuration that overwrites forwarded client-IP headers.
- Stripe webhook secret, approved Bixy products/prices, tax configuration, duplicate/retry test evidence, and refund policy.
- Staging database/provider credentials and a rehearsed additive migration process.
- Error monitoring, alert routing, admin MFA, email verification, and credential rotation.

## Known validation boundary

Local tests use synthetic providers and databases. They do not prove real inbox delivery, cloud IAM, a production malware scanner, provider backup/restore, or external alert delivery. These require explicit staging and IT verification.

## Community readiness

No community chat system is implemented. Existing session, role, moderation, rate-limit, and private-record boundaries should be reused before adding one. A future community feature must add explicit membership/visibility rules, moderation, abuse throttling, reporting, retention, and audit behavior before launch.
