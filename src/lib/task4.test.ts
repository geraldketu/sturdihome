import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = process.cwd();
const schema = readFileSync(`${root}/prisma/schema.prisma`, "utf8");
const statusAction = readFileSync(`${root}/src/lib/actions/financing-status-actions.ts`, "utf8");
const accountAction = readFileSync(`${root}/src/lib/actions/account-actions.ts`, "utf8");
const memberRequest = readFileSync(`${root}/src/lib/actions/member-actions.ts`, "utf8");
const statusPage = readFileSync(`${root}/src/app/account-status/page.tsx`, "utf8");

test("Task 4 preserves records and isolates lender status reporting", () => {
  assert.match(schema, /accountStatus\s+String\s+@default\("ACTIVE"\)/);
  assert.match(schema, /financingAccessStatus\s+String\s+@default\("ACTIVE"\)/);
  assert.match(schema, /model AccountCancellationAudit/);
  assert.match(schema, /model MemberStandingAcceptance/);
  assert.match(schema, /model FinancingStatusReport/);
  assert.match(schema, /model FinancingStatusDispute/);
  assert.match(accountAction, /accountStatus: "CANCELLED"/);
  assert.match(accountAction, /authSession\.deleteMany/);
  assert.match(statusAction, /assignedPartner: \{ userId: user\.id \}/);
  assert.match(statusAction, /ownRelationshipConfirmed/);
  assert.match(statusAction, /noCollectionConfirmed/);
  assert.match(memberRequest, /financingAccessStatus !== "ACTIVE"/);
  assert.match(statusPage, /reporting finance partner/);
  assert.match(statusPage, /Dispute or Report an Error/);
});
