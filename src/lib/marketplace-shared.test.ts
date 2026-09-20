import assert from "node:assert/strict";
import { test } from "node:test";
import { listingSchema, splitLines } from "./marketplace-shared";

const draft = {
  companyName: "Example business", description: "A test business description for validation.",
  services: "Repairs", categories: ["Handyman"], areas: ["Atlanta", "30301"],
  website: "", email: "", phone: "", logo: "", photos: [], published: false,
};
test("a draft can omit contacts, but a public listing needs a direct contact method", () => {
  assert.equal(listingSchema.safeParse(draft).success, true);
  assert.equal(listingSchema.safeParse({ ...draft, published: true }).success, false);
  for (const contact of [{ website: "https://example.com" }, { email: "hello@example.com" }, { phone: "+1 (404) 555-0100" }]) {
    assert.equal(listingSchema.safeParse({ ...draft, ...contact, published: true }).success, true);
  }
});
test("public links reject active content, non-HTTPS URLs and embedded credentials", () => {
  for (const website of ["javascript:alert(1)", "data:text/html,test", "http://example.com", "https://user:password@example.com"]) {
    assert.equal(listingSchema.safeParse({ ...draft, website }).success, false);
    assert.equal(listingSchema.safeParse({ ...draft, logo: website }).success, false);
    assert.equal(listingSchema.safeParse({ ...draft, photos: [website] }).success, false);
  }
});
test("category, photo limits and direct contact values are validated", () => {
  assert.equal(listingSchema.safeParse({ ...draft, categories: ["Invented category"] }).success, false);
  assert.equal(listingSchema.safeParse({ ...draft, photos: Array(9).fill("https://example.com/a.png") }).success, false);
  assert.equal(listingSchema.safeParse({ ...draft, phone: "555?body=message" }).success, false);
  assert.equal(listingSchema.safeParse({ ...draft, email: "test@example.com?bcc=other@example.com" }).success, false);
  assert.deepEqual(splitLines("Atlanta, 30301\nAtlanta\n "), ["Atlanta", "30301"]);
});
