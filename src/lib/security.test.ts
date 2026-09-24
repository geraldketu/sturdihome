import test from "node:test";
import assert from "node:assert/strict";
import { validateUpload, MAX_UPLOAD_BYTES } from "./upload-validation";
import { signSessionToken, verifySessionToken } from "./jwt";

test("upload rejects scripts, forged MIME, oversized and empty files", async () => {
  for (const f of [new File(['<script>alert(1)</script>'],'a.svg',{type:'image/svg+xml'}),new File(['not png'],'a.png',{type:'image/png'}),new File([],'a.pdf',{type:'application/pdf'}),new File([new Uint8Array(MAX_UPLOAD_BYTES+1)],'a.pdf',{type:'application/pdf'})]) await assert.rejects(validateUpload(f));
  await validateUpload(new File(['%PDF-1.7\ntest'],'a.pdf',{type:'application/pdf'}));
  await validateUpload(new File([new Uint8Array([137,80,78,71,13,10,26,10])],'a.png',{type:'image/png'}));
});
test("session token tampering cannot grant admin privileges", async () => {
  process.env.JWT_SECRET='synthetic-test-secret-not-used-in-production';
  const token=await signSessionToken({sub:'test-user',sid:'test-session',role:'HOMEOWNER'});
  assert.equal((await verifySessionToken(token))?.role,'HOMEOWNER');
  const segments=token.split('.');const payload=JSON.parse(Buffer.from(segments[1],'base64url').toString());payload.role='ADMIN';segments[1]=Buffer.from(JSON.stringify(payload)).toString('base64url');
  assert.equal(await verifySessionToken(segments.join('.')),null);
  assert.equal(await verifySessionToken('invalid'),null);
});
