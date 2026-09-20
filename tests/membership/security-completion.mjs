import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const require=createRequire(new URL('../../node_modules/.cache/membership-tools/package.json',import.meta.url));
const {chromium}=require('playwright');
const base='http://127.0.0.1:3000';
const query=async(sql,params=[])=>{const r=await fetch('http://127.0.0.1:55440',{method:'POST',body:JSON.stringify({sql,params})});if(!r.ok)throw Error(await r.text());return r.json()};
const control=async v=>fetch('http://127.0.0.1:55441/control',{method:'POST',body:JSON.stringify(v)});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results=[];const pass=s=>{results.push(s);console.log('PASS',s)};
async function login(id,password='Review-only-Password42') {const c=await browser.newContext();const p=await c.newPage();await p.goto(base+'/login');await p.getByLabel('Email',{exact:true}).fill(id+'@example.test');await p.getByLabel('Password',{exact:true}).fill(password);await p.getByRole('button',{name:'Sign In',exact:true}).click();await p.waitForURL('**/welcome');await p.getByRole('button',{name:'Continue now'}).click();await p.waitForURL(u=>u.pathname!='/welcome');return {c,p};}
try {
 await query('DELETE FROM "AuthThrottle"');
 const admin=await login('test-admin');
 let approvalRequest;
 for(const [id,role,dashboard,adminPath] of [['test-member','HOMEOWNER','/member','/admin/members/test-member'],['test-vendor','VENDOR','/vendor','/admin/vendors/vp'],['test-finance','FINANCING_PARTNER','/financing','/admin/financing-partners/fp']]) {
  await query('DELETE FROM "AgreementAcceptance" WHERE "userId"=$1',[id]);
  await query('UPDATE "User" SET "agreementVersion"=NULL,"approvalStatus"=\'PENDING\' WHERE id=$1',[id]);
  const user=await login(id);
  for(const route of [dashboard, '/marketplace/vendors','/marketplace/financing']) {await user.p.goto(base+route);assert.equal(new URL(user.p.url()).pathname,'/agreement');}
  assert.equal((await user.c.request.post(base+'/api/chat',{data:{}})).status(),403);
  await admin.p.goto(base+adminPath);assert.equal(await admin.p.getByRole('button',{name:'Approve Account',exact:true}).isDisabled(),true);
    await user.p.getByRole('checkbox',{name:/I have read and agree/}).check();await user.p.getByRole('checkbox',{name:/I consent to electronic/}).check();await user.p.getByLabel('Full Legal Name',{exact:true}).fill(role==='HOMEOWNER'?'Felicia Member':role==='VENDOR'?'Victor Vendor':'Fiona Finance');if(role!=='HOMEOWNER') await user.p.getByLabel('Company Name',{exact:true}).fill(role==='VENDOR'?'Test Plumbing':'Test Finance');await user.p.getByLabel('Electronic Signature',{exact:true}).fill(role==='HOMEOWNER'?'Felicia Member':role==='VENDOR'?'Victor Vendor':'Fiona Finance');await user.p.getByRole('button',{name:'AGREE & SIGN',exact:true}).click();await user.p.waitForURL('**/pending-approval');
  await user.p.goto(base+dashboard);assert.equal(new URL(user.p.url()).pathname,'/pending-approval');
  await admin.p.goto(base+adminPath);
  const request=admin.p.waitForRequest(r=>r.method()==='POST'&&!!r.headers()['next-action']);
  await admin.p.getByRole('button',{name:'Approve Account',exact:true}).click();approvalRequest=await request;
  await admin.p.getByText(/Account: APPROVED/).waitFor();
  await user.p.goto(base+dashboard);assert.equal(new URL(user.p.url()).pathname,dashboard);
  const row=(await query('SELECT "approvalStatus","approvalReviewedBy","agreementVersion" FROM "User" WHERE id=$1',[id]))[0];assert.equal(row.approvalStatus,'APPROVED');assert.equal(row.approvalReviewedBy,'test-admin');assert.equal(row.agreementVersion,'test-v1');
  assert.ok((await query('SELECT id FROM "ApprovalAudit" WHERE "userId"=$1',[id])).length);
  await admin.p.getByRole('button',{name:'Reject / Revoke Access'}).click();await admin.p.getByText(/Account: REJECTED/).waitFor();
  await user.p.goto(base+dashboard);assert.equal(new URL(user.p.url()).pathname,'/pending-approval');
  assert.equal((await user.c.request.post(base+'/api/chat',{data:{}})).status(),403);
  await admin.p.getByRole('button',{name:'Approve Account',exact:true}).click();await admin.p.getByText(/Account: APPROVED/).waitFor();
  pass(role+': agreement required, acceptance alone blocked, manual admin approval persisted/audited, revocation immediate');
  await user.c.close();
 }
 const member=await login('test-member');
 const auditBefore=(await query('SELECT count(*)::int AS n FROM "ApprovalAudit"'))[0].n;
 await member.c.request.post(base+'/',{headers:{'next-action':approvalRequest.headers()['next-action'],'content-type':approvalRequest.headers()['content-type'],origin:base},data:approvalRequest.postDataBuffer()});
 assert.equal((await query('SELECT count(*)::int AS n FROM "ApprovalAudit"'))[0].n,auditBefore);pass('Ordinary member cannot replay an admin approval action');
 for(const [id,role,dashboard,adminPath] of [['test-vendor','VENDOR','/vendor','/admin/vendors/vp'],['test-finance','FINANCING_PARTNER','/financing','/admin/financing-partners/fp']]) {
  await query('UPDATE "NetworkAgreement" SET active=false WHERE role=$1',[role]);
  const user=await login(id);await user.p.goto(base+dashboard);assert.equal(new URL(user.p.url()).pathname,'/agreement');assert.equal(await user.p.getByRole('checkbox').count(),0);
  await admin.p.goto(base+adminPath);assert.equal(await admin.p.getByRole('button',{name:'Approve Account',exact:true}).isDisabled(),true);
  // Even an already-approved profile and an existing acceptance cannot override absent terms.
  assert.equal((await user.c.request.post(base+'/api/chat',{data:{}})).status(),403);
  if(role==='VENDOR'){await member.p.goto(base+'/marketplace/vendors');assert.equal(await member.p.getByRole('heading',{name:'Test Plumbing',exact:true}).count(),0);}
  await query('UPDATE "NetworkAgreement" SET active=true WHERE role=$1',[role]);await user.c.close();
  pass(role+': absent approved terms blocks dashboard, chat, approval UI and discovery');
 }
 await query('UPDATE "NetworkAgreement" SET version=\'test-v2\' WHERE role=\'HOMEOWNER\'');await member.p.goto(base+'/member');assert.equal(new URL(member.p.url()).pathname,'/agreement');await query('UPDATE "NetworkAgreement" SET version=\'test-v1\' WHERE role=\'HOMEOWNER\'');pass('Changed agreement version requires renewed acceptance');
 await member.p.goto(base+'/member/documents');
 const label='Durable '+Date.now();const pdf=Buffer.from('%PDF-1.7\nSynthetic private document\n%%EOF');
 async function upload(name,bytes=pdf) {await member.p.getByLabel('Document Label').fill(name);await member.p.locator('input[type=file]').setInputFiles({name:'private.pdf',mimeType:'application/pdf',buffer:bytes});await member.p.getByRole('button',{name:'Upload Document',exact:true}).click();}
 await upload(label);await member.p.getByText(label,{exact:true}).waitFor();
 const doc=(await query('SELECT id,"fileName" FROM "Document" WHERE label=$1',[label]))[0];assert.ok(doc.fileName.startsWith('s3:'));
 const download=await member.c.request.get(base+'/api/documents/'+doc.id);assert.equal(download.status(),200);assert.deepEqual(await download.body(),pdf);assert.equal(download.headers()['cache-control'],'private, no-store');assert.match(download.headers()['content-disposition'],/^attachment/);
 const vendor=await login('test-vendor');assert.equal((await vendor.c.request.get(base+'/api/documents/'+doc.id)).status(),403);await vendor.c.close();
 assert.equal((await admin.c.request.get(base+'/api/documents/'+doc.id)).status(),200);
 const before=(await query('SELECT count(*)::int AS n FROM "Document"'))[0].n;
 await control({privateBucket:false});await upload('Public bucket rejected');await member.p.getByText('The file could not be saved. Please try again.').waitFor();assert.equal((await query('SELECT count(*)::int AS n FROM "Document"'))[0].n,before);
 await control({privateBucket:true,clean:false});await upload('Scanner rejected');await member.p.getByText('The file could not be saved. Please try again.').waitFor();assert.equal((await query('SELECT count(*)::int AS n FROM "Document"'))[0].n,before);await control({clean:true});
 pass('Private S3 upload/download, exact bytes, owner/admin permissions, public bucket and infected verdict rejection');
 const cookies=await member.c.cookies();
 await member.p.goto(base+'/forgot-password');await member.p.getByLabel('Email',{exact:true}).fill('test-member@example.test');await member.p.getByRole('button',{name:/Send reset/i}).click();await member.p.getByText(/If an account matches/).waitFor();
 const mails=await (await fetch('http://127.0.0.1:55441/mail')).json();const delivered=mails.findLast(m=>m.to.includes('test-member@example.test'));assert.ok(delivered);const resetUrl=delivered.text.match(/http:\/\/\S+/)[0];const token=new URL(resetUrl).searchParams.get('token');
 const records=await query('SELECT "tokenHash" FROM "PasswordReset" WHERE "userId"=\'test-member\'');assert.ok(records.length);assert.ok(records.every(r=>r.tokenHash!==token));
 await member.p.goto(resetUrl);await member.p.getByLabel('New password',{exact:true}).fill('Changed-Review-Password42');await member.p.getByLabel('Confirm password',{exact:true}).fill('Changed-Review-Password42');await member.p.getByRole('button',{name:'Reset password',exact:true}).click();await member.p.waitForURL('**/login?reset=success');
 assert.equal((await query('SELECT count(*)::int AS n FROM "AuthSession" WHERE "userId"=\'test-member\''))[0].n,0);
 await member.c.addCookies(cookies);assert.equal((await member.c.request.get(base+'/api/documents/'+doc.id)).status(),401);
 await member.p.goto(resetUrl);await member.p.getByLabel('New password',{exact:true}).fill('Another-Password42');await member.p.getByLabel('Confirm password',{exact:true}).fill('Another-Password42');await member.p.getByRole('button',{name:'Reset password',exact:true}).click();await member.p.getByText(/invalid or expired/).waitFor();
 const changed=await login('test-member','Changed-Review-Password42');await changed.c.close();
 await control({failEmail:true});await member.p.goto(base+'/forgot-password');await member.p.getByLabel('Email',{exact:true}).fill('test-member@example.test');await member.p.getByRole('button',{name:/Send reset/i}).click();await member.p.getByText(/If an account matches/).waitFor();assert.equal((await query('SELECT count(*)::int AS n FROM "PasswordReset" WHERE "userId"=\'test-member\''))[0].n,0);await control({failEmail:false});
 pass('Reset email delivered through local provider, hashed token consumed once, sessions revoked, new password works, failed email token removed');
 // Restore synthetic password for the independent regression suites.
 await query('UPDATE "User" SET "passwordHash"=(SELECT "passwordHash" FROM "User" WHERE id=\'test-admin\') WHERE id=\'test-member\'');
 await member.c.close();await admin.c.close();
 writeFileSync('docs/security-review/completion-results.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));
}finally{await browser.close()}
