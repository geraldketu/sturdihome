# SturdiHome Operations and Rollback Runbook

## Production backup requirements

Before production migration or deployment, the operator must confirm:

- PostgreSQL provider point-in-time recovery and daily backups are enabled.
- A recent backup restore has been rehearsed in an isolated staging database.
- Private object storage has versioning, retention, encryption, and backup/recovery enabled.
- Legacy local uploads have been inventoried and hash-verified before serverless rollout.
- Backup credentials are held by the production secrets manager and are never placed in source control.

This repository cannot prove provider-level backup or restore configuration. Record the backup timestamp, restore test result, operator, and retention policy in the release checklist.

## Deployment rollback

1. Stop the release and preserve deployment logs.
2. Do not reset or force-push Git history.
3. In Vercel, promote the last known-good deployment to production.
4. Do not roll back the database automatically. Determine whether the release used additive schema changes.
5. For additive migrations, keep the schema and roll back application code only when backward compatibility is verified.
6. For an incompatible migration, restore the database only from an approved backup after owner/IT approval and a staging rehearsal.
7. Verify login, Admin, Member, Vendor, Finance/Lender, Bixy, document authorization, Stripe webhook signature handling, and health endpoints.
8. Record the incident, deployment IDs, migration state, backup/restore evidence, and follow-up actions.

No production rollback or restore is authorized by this document alone.
