import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

const require = createRequire(new URL("../../node_modules/.cache/membership-tools/package.json", import.meta.url));
const { chromium } = require("playwright");
const base = "http://127.0.0.1:3000";
const query = async (sql, params = []) => {
  const response = await fetch("http://127.0.0.1:55440", { method: "POST", body: JSON.stringify({ sql, params }) });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const results = [];
const newVersion = `test-v2-${Date.now()}`;
const pass = (label) => { results.push(label); console.log("PASS", label); };

async function login(id) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/login`);
  await page.getByLabel("Email", { exact: true }).fill(`${id}@example.test`);
  await page.getByLabel("Password", { exact: true }).fill("Review-only-Password42");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL("**/welcome");
  await page.getByRole("button", { name: "Continue now" }).click();
  await page.waitForURL((url) => url.pathname !== "/welcome");
  return { context, page };
}

async function prepareUser(id, role) {
  await query('DELETE FROM "AgreementAcceptance" WHERE "userId"=$1', [id]);
  await query('UPDATE "User" SET "agreementVersion"=NULL,"agreementAcceptedAt"=NULL,"approvalStatus"=\'APPROVED\' WHERE id=$1', [id]);
  if (role !== "HOMEOWNER") await query('UPDATE "VendorProfile" SET status=\'APPROVED\' WHERE "userId"=$1', [id]).catch(() => {});
  if (role === "FINANCING_PARTNER") await query('UPDATE "FinancingPartnerProfile" SET status=\'APPROVED\' WHERE "userId"=$1', [id]);
}

async function sign(page, role, legalName, companyName) {
  await page.getByRole("checkbox", { name: /I have read and agree/ }).check();
  await page.getByRole("checkbox", { name: /I consent to electronic/ }).check();
  await page.getByLabel("Full Legal Name", { exact: true }).fill(legalName);
  if (companyName) await page.getByLabel("Company Name", { exact: true }).fill(companyName);
  await page.getByLabel("Electronic Signature", { exact: true }).fill(legalName);
  assert.equal(await page.getByRole("button", { name: "AGREE & SIGN", exact: true }).isDisabled(), false);
  await page.getByRole("button", { name: "AGREE & SIGN", exact: true }).click();
  await page.waitForURL("**/pending-approval");
  const id = role === "HOMEOWNER" ? "test-member" : role === "VENDOR" ? "test-vendor" : "test-finance";
  await query('UPDATE "User" SET "approvalStatus"=\'APPROVED\',"approvalReviewedBy"=\'test-admin\',"approvalReviewedAt"=now() WHERE id=$1', [id]);
}

try {
  const roles = [
    ["test-member", "HOMEOWNER", "/member", "Felicia Member", undefined],
    ["test-vendor", "VENDOR", "/vendor", "Victor Vendor", "Test Plumbing"],
    ["test-finance", "FINANCING_PARTNER", "/financing", "Fiona Finance", "Test Finance"],
  ];

  for (const [id, role, dashboard, legalName, companyName] of roles) {
    await prepareUser(id, role);
    const account = await login(id);
    await account.page.goto(`${base}${dashboard}`);
    assert.equal(new URL(account.page.url()).pathname, "/agreement");
    await sign(account.page, role, legalName, companyName);
    await account.page.goto(`${base}${dashboard}`);
    assert.equal(new URL(account.page.url()).pathname, dashboard);
    const record = (await query('SELECT * FROM "AgreementAcceptance" WHERE "userId"=$1', [id]))[0];
    assert.equal(record.role, role);
    assert.equal(record.version, "test-v1");
    assert.equal(record.fullLegalName, legalName);
    assert.equal(record.electronicSignature, legalName);
    assert.equal(record.consentToElectronicRecords, true);
    pass(`TEST ${role === "HOMEOWNER" ? 1 : role === "VENDOR" ? 2 : 3}: agreement saved and dashboard unlocked`);
    await account.context.close();
  }

  const member = await login("test-member");
  await member.page.goto(`${base}/member`);
  assert.equal(new URL(member.page.url()).pathname, "/member");
  await member.context.clearCookies();
  await member.page.goto(`${base}/login`);
  const loggedInAgain = await login("test-member");
  assert.equal(new URL(loggedInAgain.page.url()).pathname, "/member");
  pass("TEST 4: logout/login preserves signed status");

  await loggedInAgain.page.goto(`${base}/member/documents`);
  await loggedInAgain.page.getByText(/Member Terms & Conditions|TEST Agreement/).waitFor();
  const acceptanceId = (await query('SELECT id FROM "AgreementAcceptance" WHERE "userId"=\'test-member\' AND version=\'test-v1\''))[0].id;
  const signedCopy = await loggedInAgain.context.request.get(`${base}/api/agreements/${acceptanceId}/copy`);
  assert.equal(signedCopy.status(), 200);
  assert.match(await signedCopy.text(), /SIGNED ELECTRONICALLY|SYNTHETIC SIGNED COPY/);
  pass("TEST 5: signed agreement appears in Member Documents and downloads");

  const admin = await login("test-admin");
  await admin.page.goto(`${base}/admin/agreements`);
  await admin.page.getByText(/Acceptance history/).waitFor();
  await admin.page.getByText("Felicia Member").waitFor();
  pass("TEST 6: admin can view acceptance history");

  await query('DELETE FROM "AgreementAcceptance" WHERE "userId"=\'test-member\'');
  await query('UPDATE "User" SET "agreementVersion"=NULL,"agreementAcceptedAt"=NULL WHERE id=\'test-member\'');
  await loggedInAgain.page.goto(`${base}/member`);
  assert.equal(new URL(loggedInAgain.page.url()).pathname, "/agreement");
  assert.equal(await loggedInAgain.page.getByRole("button", { name: "AGREE & SIGN", exact: true }).isDisabled(), true);
  assert.equal((await loggedInAgain.context.request.post(`${base}/api/chat`, { data: {} })).status(), 403);
  pass("TEST 7: unsigned member cannot bypass agreement requirement");

  const currentCount = (await query('SELECT count(*)::int AS n FROM "AgreementAcceptance" WHERE "userId"=\'test-member\' AND version=\'test-v1\''))[0].n;
  assert.equal(currentCount, 0);
  await sign(loggedInAgain.page, "HOMEOWNER", "Felicia Member");
  const afterFirstSign = (await query('SELECT count(*)::int AS n FROM "AgreementAcceptance" WHERE "userId"=\'test-member\' AND version=\'test-v1\''))[0].n;
  assert.equal(afterFirstSign, 1);
  await loggedInAgain.page.goto(`${base}/member`);
  assert.equal(new URL(loggedInAgain.page.url()).pathname, "/member");
  assert.equal((await query('SELECT count(*)::int AS n FROM "AgreementAcceptance" WHERE "userId"=\'test-member\' AND version=\'test-v1\''))[0].n, 1);
  pass("TEST 8: same agreement version is requested and recorded only once");

  const newAgreementId = randomUUID();
  await query('UPDATE "NetworkAgreement" SET active=false WHERE role=\'HOMEOWNER\'');
  await query('INSERT INTO "NetworkAgreement" (id,role,version,title,content,"effectiveDate","documentIdentifier",active) VALUES ($1,\'HOMEOWNER\',$2,\'TEST Agreement v2\',\'SYNTHETIC TEST VERSION 2\',TIMESTAMP \'2026-09-19 00:00:00\',\'synthetic-homeowner-v2\',true)', [newAgreementId, newVersion]);
  await query('UPDATE "NetworkAgreement" SET active=false WHERE role=\'HOMEOWNER\' AND version=\'test-v1\'');
  await loggedInAgain.page.goto(`${base}/member`);
  assert.equal(new URL(loggedInAgain.page.url()).pathname, "/agreement");
  await sign(loggedInAgain.page, "HOMEOWNER", "Felicia Member");
  assert.equal((await query('SELECT count(*)::int AS n FROM "AgreementAcceptance" WHERE "userId"=\'test-member\''))[0].n, 2);
  await query('UPDATE "NetworkAgreement" SET active=false WHERE role=\'HOMEOWNER\'');
  await query('UPDATE "NetworkAgreement" SET active=true WHERE role=\'HOMEOWNER\' AND version=\'test-v1\'');
  pass("TEST 9: new active version triggers re-acceptance without deleting prior signed copy");

  await query('DELETE FROM "VendorReferral" WHERE "vendorUserId"=\'test-vendor\'');
  const vendor = await login("test-vendor");
  await vendor.page.goto(`${base}/vendor/referrals`);
  await vendor.page.getByRole("button", { name: "Create Referral Link" }).click();
  const referralText = await vendor.page.locator("text=https://sturdyhomenetwork.com/signup?referral=").last().innerText();
  const referralCode = referralText.split("referral=")[1].trim();
  const customerEmail = `referred-${Date.now()}@example.test`;
  const customer = await vendor.context.browser().newContext();
  const customerPage = await customer.newPage();
  await customerPage.goto(`${base}/signup?referral=${referralCode}`);
  await customerPage.getByLabel("Full Name", { exact: true }).fill("Referred Customer");
  await customerPage.getByLabel("Email", { exact: true }).fill(customerEmail);
  await customerPage.getByLabel("Password", { exact: true }).fill("Review-only-Password42");
  await customerPage.getByRole("button", { name: "Create Account", exact: true }).click();
  await customerPage.waitForURL("**/welcome");
  await customerPage.getByRole("button", { name: "Continue now" }).click();
  await customerPage.waitForURL("**/agreement");
  await sign(customerPage, "HOMEOWNER", "Referred Customer");
  const customerRow = (await query('SELECT id,role FROM "User" WHERE email=$1', [customerEmail]))[0];
  assert.equal(customerRow.role, "HOMEOWNER");
  await vendor.page.goto(`${base}/vendor/referrals`);
  const vendorText = await vendor.page.locator("body").innerText();
  assert.match(vendorText, /ACCEPTED/);
  assert.equal(vendorText.includes(customerEmail), false);
  assert.equal((await vendor.context.request.get(`${base}/member/financing-request`, { maxRedirects: 0 })).status(), 307);
  const referral = (await query('SELECT "customerId" FROM "VendorReferral" WHERE code=$1', [referralCode]))[0];
  assert.equal(referral.customerId, customerRow.id);
  pass("TEST 10: vendor referral creates a separate member account and exposes status only, not private financing access");

  writeFileSync("docs/membership-review/task2-agreement-results.json", JSON.stringify({ testedAt: new Date().toISOString(), results }, null, 2));
  console.log("ALL TASK 2 TESTS PASSED", results.length);
} finally {
  await browser.close();
}