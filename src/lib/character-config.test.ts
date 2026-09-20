import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_FREE_SECONDS, CHARACTER_PLANS, CHARACTER_VOICES, CHARACTER_TALKING_VIDEO_AVAILABLE } from "@/lib/character-config";

test("Task 3 character positioning, voice separation, and approved prices are configured", () => {
  assert.equal(CHARACTER_FREE_SECONDS, 60);
  assert.equal(CHARACTER_PLANS.fiveMinute.amountCents, 499);
  assert.equal(CHARACTER_PLANS.fiveMinute.seconds, 300);
  assert.equal(CHARACTER_PLANS.tenMinute.amountCents, 1999);
  assert.equal(CHARACTER_PLANS.tenMinute.seconds, 600);
  assert.equal(CHARACTER_PLANS.tenMinute.days, 7);
  assert.notEqual(CHARACTER_VOICES.sturdiGirl.pitch, CHARACTER_VOICES.brixy.pitch);
  assert.notEqual(CHARACTER_VOICES.sturdiGirl.rate, CHARACTER_VOICES.brixy.rate);
  assert.equal(CHARACTER_TALKING_VIDEO_AVAILABLE.sturdiGirl, true);
  assert.equal(CHARACTER_TALKING_VIDEO_AVAILABLE.brixy, true);
});