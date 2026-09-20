import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = process.cwd();
const schema = readFileSync(`${root}/prisma/schema.prisma`, "utf8");
const migration = readFileSync(`${root}/prisma/task12-admin-account-actions.sql`, "utf8");
const adminActions = readFileSync(`${root}/src/lib/actions/admin-actions.ts`, "utf8");
const storage = readFileSync(`${root}/src/lib/private-storage.ts`, "utf8");
const documentRoute = readFileSync(`${root}/src/app/api/documents/[id]/route.ts`, "utf8");
const adminControls = readFileSync(`${root}/src/components/AdminAccountActions.tsx`, "utf8");

test("Task 12 keeps sensitive identity fields out of managed applications", () => {
  assert.doesNotMatch(schema, /ssn|social.?security|date.?of.?birth|\bdob\b|street.?address|government.?id/i);
  assert.doesNotMatch(adminActions, /reveal|decrypt|social.?security|date.?of.?birth/i);
  assert.match(storage, /ServerSideEncryption: "AES256"/);
  assert.match(documentRoute, /document\.userId !== user\.id && user\.role !== "ADMIN"/);
});

test("Task 12 separates approval decisions from access revocation", () => {
  assert.match(schema, /model AdminAccountActionAudit/);
  assert.match(migration, /AdminAccountActionAudit/);
  assert.match(adminActions, /approveAccountAction/);
  assert.match(adminActions, /rejectAccountAction/);
  assert.match(adminActions, /revokeAccessAction/);
  assert.match(adminControls, /Approve Account/);
  assert.match(adminControls, /Reject Account/);
  assert.match(adminControls, /Revoke Access/);
  assert.doesNotMatch(adminControls, /Reject \/ Revoke/);
});