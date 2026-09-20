import test from "node:test";
import assert from "node:assert/strict";
import { joinUrl, roleHome, routeRoles, safeReturnTo, welcomeCopy } from "./access";

test("return destinations reject external URLs, auth loops, APIs and wrong roles", () => {
  for (const target of ["https://evil.test", "//evil.test", "/\\evil.test", "/%2f%2fevil.test", "/login", "/welcome", "/api/chat", "/member/../../login", "/member\n"]) {
    assert.equal(safeReturnTo(target, "HOMEOWNER"), null, target);
  }
  assert.equal(safeReturnTo("/vendor/leads", "HOMEOWNER"), null);
  assert.equal(safeReturnTo("/member/documents", "VENDOR"), null);
  assert.equal(safeReturnTo("/financing/referrals", "VENDOR"), null);
  assert.equal(safeReturnTo("/marketplace/vendors?category=Plumbing&location=Atlanta", "HOMEOWNER"), "/marketplace/vendors?category=Plumbing&location=Atlanta");
  assert.equal(safeReturnTo("/member/appointments", "HOMEOWNER"), "/member/appointments");
});

test("public information is public; all service portals have explicit roles", () => {
  for (const path of ["/", "/services", "/how-it-works", "/signup", "/join-network", "/apply/vendor", "/apply/financing"]) assert.equal(routeRoles(path), null);
  for (const [role, path] of [["HOMEOWNER", "/member"], ["VENDOR", "/vendor"], ["FINANCING_PARTNER", "/financing"], ["ADMIN", "/admin"]]) {
    assert.equal(roleHome(role), path);
    assert.ok(routeRoles(path + "/profile")?.includes(role));
  }
  assert.equal(routeRoles("/membership-info"), null);
  assert.equal(joinUrl("/marketplace/vendors?category=Roofing"), "/join-network?next=%2Fmarketplace%2Fvendors%3Fcategory%3DRoofing");
});

test("welcome uses first-login status, first names, and correct role fallback", () => {
  for (const [role,label] of [["HOMEOWNER","Member"],["VENDOR","Vendor"],["FINANCING_PARTNER","Finance Partner"]]) {
    assert.equal(welcomeCopy(role,"",false).title,`Welcome Back, ${label}! ❤️`);
    assert.equal(welcomeCopy(role,"Felicia Example",true).title,"Welcome to SturdiHome! ❤️");
    assert.equal(welcomeCopy(role,"Felicia Example",false).title,"Welcome Back, Felicia! ❤️");
  }
});
