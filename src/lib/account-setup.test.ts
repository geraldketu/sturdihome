import assert from "node:assert/strict";
import test from "node:test";
import { createHash, randomBytes } from "node:crypto";

test("setup tokens are represented as hashes and have a 48-hour expiry contract", () => {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(token, hash);
  const issued = Date.now();
  const expires = issued + 48 * 60 * 60 * 1000;
  assert.equal(expires - issued, 172800000);
});
