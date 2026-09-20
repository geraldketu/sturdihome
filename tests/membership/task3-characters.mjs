import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(new URL("../../node_modules/.cache/membership-tools/package.json", import.meta.url));
const { chromium } = require("playwright");
const base = "http://127.0.0.1:3000";
const query = async (sql, params = []) => { const response = await fetch("http://127.0.0.1:55440", { method: "POST", body: JSON.stringify({ sql, params }) }); if (!response.ok) throw new Error(await response.text()); return response.json(); };
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const results = [];
const pass = (label) => { results.push(label); console.log("PASS", label); };
try {
  const visitor = await browser.newPage();
  assert.equal((await visitor.request.get(`${base}/api/character/status`)).status(), 401); pass("Unauthorized character status is rejected");
  await visitor.goto(`${base}/login`); await visitor.getByLabel("Email", { exact: true }).fill("test-member@example.test"); await visitor.getByLabel("Password", { exact: true }).fill("Review-only-Password42"); await visitor.getByRole("button", { name: "Sign In", exact: true }).click(); await visitor.waitForURL("**/welcome"); await visitor.getByRole("button", { name: "Continue now" }).click(); await visitor.waitForURL((url) => url.pathname !== "/welcome");
  const context = visitor.context();
  await query('DELETE FROM "CharacterUsage" WHERE "userId"=\'test-member\'');
  await query('DELETE FROM "CharacterEntitlement" WHERE "userId"=\'test-member\'');
  const status = await context.request.get(`${base}/api/character/status`); assert.equal(status.status(), 200); assert.equal((await status.json()).freeSecondsRemaining, 60); pass("Every eligible account receives 60 free seconds");
  await query('UPDATE "CharacterEntitlement" SET "freeSecondsRemaining"=1,"paidSecondsRemaining"=0,"status"=\'FREE\' WHERE "userId"=\'test-member\'');
  const chatBody = { character: "sturdiGirl", messages: [{ id: "x", role: "user", parts: [{ type: "text", text: "What should I do next?" }] }] };
  const first = await context.request.post(`${base}/api/chat`, { data: chatBody }); assert.notEqual(first.status(), 402); assert.equal((await query('SELECT "freeSecondsRemaining" FROM "CharacterEntitlement" WHERE "userId"=\'test-member\''))[0].freeSecondsRemaining, 0); pass("Free allowance is consumed server-side before provider access");
  const exhausted = await context.request.post(`${base}/api/chat`, { data: chatBody }); assert.equal(exhausted.status(), 402); pass("Exhausted free access blocks further interaction before provider call");
  await query('UPDATE "CharacterEntitlement" SET "freeSecondsRemaining"=0,"paidSecondsRemaining"=2,"plan"=\'character-5m\',"status"=\'PAID\',"expiresAt"=NULL WHERE "userId"=\'test-member\'');
  const girl = await context.request.post(`${base}/api/chat`, { data: { ...chatBody, character: "sturdiGirl" } }); const brixy = await context.request.post(`${base}/api/chat`, { data: { ...chatBody, character: "brixy" } }); assert.notEqual(girl.status(), 402); assert.notEqual(brixy.status(), 402); assert.equal((await query('SELECT count(*)::int AS n FROM "CharacterUsage" WHERE "userId"=\'test-member\' AND source=\'PAID\''))[0].n, 2); pass("Paid balance is shared safely between Sturdi Girl and Brixy");
  await query('UPDATE "CharacterEntitlement" SET "paidSecondsRemaining"=600,"plan"=\'character-10m-7d\',"status"=\'PAID\',"expiresAt"=now()-interval \'1 day\' WHERE "userId"=\'test-member\'');
  const expired = await context.request.get(`${base}/api/character/status`); const expiredStatus = await expired.json(); assert.equal(expiredStatus.hasAccess, false); assert.equal(expiredStatus.paidSecondsRemaining, 0); pass("Seven-day paid access expires and unused minutes are removed");
  const forged = await context.request.post(`${base}/api/chat`, { data: { ...chatBody, entitlement: { paidSecondsRemaining: 999999 } } }); assert.equal(forged.status(), 402); pass("Client-supplied entitlement values cannot bypass server limits");
  assert.equal((await context.request.post(`${base}/api/webhooks/stripe`, { headers: { "stripe-signature": "invalid" }, data: {} })).status(), 400); pass("Failed or forged Stripe confirmation cannot unlock character access");
  await visitor.close(); console.log("ALL TASK 3 CHARACTER TESTS PASSED", results.length);
} finally { await browser.close(); }
