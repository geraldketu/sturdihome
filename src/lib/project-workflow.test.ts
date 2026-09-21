import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVE_PROJECT_STATUSES, PROJECT_STATUSES, projectStatusLabel } from "./project-workflow";

test("project lifecycle has one shared status vocabulary and active capacity states", () => {
  assert.ok(PROJECT_STATUSES.includes("FINANCING_REQUESTED"));
  assert.ok(PROJECT_STATUSES.includes("CHANGE_ORDER_PENDING"));
  assert.ok(PROJECT_STATUSES.includes("COMPLETED"));
  assert.ok(ACTIVE_PROJECT_STATUSES.includes("WORK_IN_PROGRESS"));
  assert.ok(!ACTIVE_PROJECT_STATUSES.includes("COMPLETED"));
  assert.equal(projectStatusLabel("FINAL_QUOTE_SUBMITTED"), "FINAL QUOTE SUBMITTED");
});
