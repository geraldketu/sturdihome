import test from "node:test";
import assert from "node:assert/strict";
import { resetEmailConfigured, sendPasswordResetEmail } from "./reset-email";
import { objectKey, scanUpload, putPrivateUpload } from "./private-storage";

test("provider configuration fails closed and never creates a local upload fallback", async () => {
  const saved = { ...process.env };
  try {
    for (const key of ["RESEND_API_KEY", "PASSWORD_RESET_FROM", "APP_BASE_URL", "UPLOAD_SCAN_URL", "UPLOAD_SCAN_TOKEN", "PRIVATE_S3_BUCKET"]) delete process.env[key];
    assert.equal(resetEmailConfigured(),false);
    await assert.rejects(sendPasswordResetEmail("test@example.test","synthetic"));
    await assert.rejects(scanUpload(new Uint8Array([1])));
    await assert.rejects(putPrivateUpload("user","test.pdf",new Uint8Array([1])));
    for(const [owner,name] of [["../admin","file.pdf"],["user","../file.pdf"],["user","https://example.test/file"]]) assert.throws(()=>objectKey(owner,name));
    process.env.RESEND_API_KEY="synthetic";process.env.PASSWORD_RESET_FROM="test@example.test";process.env.APP_BASE_URL="http://untrusted.example";
    assert.equal(resetEmailConfigured(),false);
    process.env.APP_BASE_URL="https://sturdihomenetwork.com";assert.equal(resetEmailConfigured(),true);
    process.env.UPLOAD_SCAN_URL="http://untrusted.example/scan";process.env.UPLOAD_SCAN_TOKEN="synthetic";await assert.rejects(scanUpload(new Uint8Array([1])));
  } finally {
    for(const key of Object.keys(process.env)) if(!(key in saved)) delete process.env[key];
    Object.assign(process.env,saved);
  }
});
