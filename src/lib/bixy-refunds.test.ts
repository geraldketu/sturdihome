import assert from "node:assert/strict";
import test from "node:test";
import { calculateRefundCents, refundableBalanceCents, validateRefundPercentage } from "./bixy-refunds";

test("Bixy refund percentages calculate whole-cent amounts", () => {
  for (const percentage of [1, 5, 10, 30, 40, 50, 100]) assert.equal(calculateRefundCents(10000, percentage).amountCents, percentage * 100);
  assert.equal(calculateRefundCents(9999, 33).amountCents, 3299);
});

test("Bixy refunds reject invalid percentages and cap cumulative balance", () => {
  for (const value of [0, 101, 1.5, "x"]) assert.throws(() => validateRefundPercentage(value));
  assert.equal(refundableBalanceCents(10000, [5000, 2500]), 2500);
  assert.equal(refundableBalanceCents(10000, [10000, 100]), 0);
});