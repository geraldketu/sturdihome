// Local synthetic tests only. See docs/membership-review/README.md.
import { createRequire } from "node:module";
const testRequire = createRequire(new URL("../../node_modules/.cache/membership-tools/package.json", import.meta.url));
﻿const { chromium } = testRequire('playwright');
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
const base='http://127.0.0.1:3000';
const query=async(sql,params=[])=>{const r=await fetch('http://127.0.0.1:55440',{method:'POST',body:JSON.stringify({sql,params})});if(!r.ok)throw new Error(await r.text());return r.json()};
const signIn=async(page,email)=>{await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.waitForURL('**/welcome');};
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];const pass=x=>{results.push(x);console.log('PASS',x)};
try {
 for(const role of ['vendor','financing']) {
 const context=await browser.newContext({viewport:{width:320,height:800}});const page=await context.newPage();
 await page.goto(base+'/apply/'+role);
 const email=role+'-'+Date.now()+'@example.test';
 await page.getByLabel('Contact Name',{exact:true}).fill('New '+role);await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Company Name',{exact:true}).fill('Synthetic '+role);
 if(role==='vendor'){await page.getByLabel('Service Area',{exact:true}).fill('Atlanta');await page.getByLabel('Services Offered',{exact:true}).fill('Plumbing');}else await page.locator('[name="licenseInfo"]').fill('Synthetic test license');
 await page.getByRole('button',{name:'Submit Application',exact:true}).click();await page.waitForURL('**/application-received');
 const user=(await query('SELECT id,role,"passwordSetupRequired" FROM "User" WHERE email=$1',[email]))[0];assert.equal(user.role,role==='vendor'?'VENDOR':'FINANCING_PARTNER');assert.equal(user.passwordSetupRequired,true);
 assert.equal((await query(`SELECT status FROM "${role==='vendor'?'VendorProfile':'FinancingPartnerProfile'}" WHERE "userId"=$1`,[user.id]))[0].status,'PENDING');
 await page.goto(base+'/login');await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.getByText('Your application is awaiting approval and password setup.').waitFor();
 await query(`UPDATE "User" SET "approvalStatus"='APPROVED' WHERE id=$1`,[user.id]);const token=randomBytes(32).toString('hex');
 await query('INSERT INTO "AccountSetupToken" ("tokenHash","userId","expiresAt") VALUES ($1,$2,$3)',[createHash('sha256').update(token).digest('hex'),user.id,new Date(Date.now()+60000)]);
 await page.goto(base+'/account-setup?token='+token);await page.getByLabel('Create password',{exact:true}).fill('Review-only-Password42');await page.getByLabel('Confirm password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Create Password',exact:true}).click();await page.waitForURL('**/welcome');
 assert.equal(await page.locator('h1').innerText(),'Welcome to SturdiHome! ❤️');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.match(await page.locator('main').innerText(),role==='vendor'?/as a vendor/:/as a finance partner/);
 await page.screenshot({path:'docs/membership-review/first-'+role+'-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Continue now'}).click();await page.waitForURL('**/agreement');
 await page.goto(base+(role==='vendor'?'/vendor':'/financing'));assert.equal(new URL(page.url()).pathname,'/agreement');
 pass('First '+role+' application requires approval + setup link, gets role-specific first welcome and preserves agreement gate at 320px');await context.close();
 }
 const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
 await page.goto(base+'/login');await page.getByLabel('Email',{exact:true}).fill('test-admin@example.test');await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.waitForURL('**/welcome');await page.getByRole('button',{name:'Continue now'}).click();await page.waitForURL('**/admin');
 for(const path of ['/admin/members','/admin/vendors','/admin/financing-partners','/admin/documents','/admin/requests']){const r=await page.goto(base+path);assert.equal(r.status(),200);assert.equal(new URL(page.url()).pathname,path)}pass('Existing assigned admin access remains intact');
 await context.close();
 const guest=await browser.newPage({viewport:{width:390,height:844}});await guest.goto(base+'/');await guest.getByLabel('What service do you need?').selectOption('Plumbing');await guest.getByLabel('City or ZIP code').fill('Atlanta');await guest.getByRole('button',{name:'Find Vendors',exact:true}).click();await guest.waitForURL('**/login?next=*');assert.equal(new URL(guest.url()).searchParams.get('next'),'/marketplace/vendors?category=Plumbing&location=Atlanta');pass('Homepage search sends guest to /login?next= preserving service and location');
 await signIn(guest,'test-finance@example.test');await guest.getByRole('button',{name:'Continue now'}).click();await guest.waitForURL(u=>{const x=new URL(u);return x.pathname==='/marketplace/vendors'&&x.searchParams.get('category')==='Plumbing'&&x.searchParams.get('location')==='Atlanta'});await guest.getByRole('heading',{name:'Test Plumbing'}).waitFor();pass('After sign-in the searched destination is restored');
 await guest.context().clearCookies();
 for(const [id,home,allowed,denied] of [
  ['test-member','/member',['/member','/marketplace/vendors','/marketplace/financing'],['/vendor','/vendor/leads','/financing','/financing/referrals','/admin','/admin/members']],
  ['test-vendor','/vendor',['/vendor','/vendor/leads','/marketplace/vendors'],['/member','/member/service-request','/financing','/admin','/admin/vendors','/marketplace/financing']],
  ['test-finance','/financing',['/financing','/financing/referrals','/marketplace/vendors','/marketplace/financing'],['/member','/member/service-request','/vendor','/admin','/admin/financing-partners']],
 ]) {
  const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
  await page.goto(base+'/login?next='+encodeURIComponent('/admin/members'));await signIn(page,id+'@example.test');await page.getByRole('button',{name:'Continue now'}).click();await page.waitForURL(u=>new URL(u).pathname===home);
  for(const path of allowed){await page.goto(base+path);assert.equal(new URL(page.url()).pathname,path,id+' allowed '+path)}
  for(const path of denied){await page.goto(base+path);assert.equal(new URL(page.url()).pathname,home,id+' denied '+path)}
  const cookie=(await context.cookies()).map(c=>c.name+'='+c.value).join('; ');
  for(const path of ['/api/documents/fake','/api/vendor-flyers/fake']){const r=await fetch(base+path,{headers:{cookie}});const own=(id==='test-member'&&path.startsWith('/api/documents'))||(id==='test-vendor'&&path.startsWith('/api/vendor-flyers'));assert.equal(r.status,own?404:403,id+' '+path)}
  pass(id+' role restrictions: allowed areas open, other portals/admin and wrong-role return URL redirect home, cross-role APIs forbidden');
  await context.close();
 }
 const resetResponse=async email=>{await guest.goto(base+'/forgot-password');await guest.getByLabel('Email',{exact:true}).fill(email);await guest.getByRole('button',{name:'Send reset link',exact:true}).click();const msg=guest.getByText(/If an account matches|temporarily unavailable/);await msg.waitFor();return msg.innerText();};
 const unknownReply=await resetResponse('unknown@example.test');
 // Without an email provider configured nothing is sent, so a real account can be compared safely.
 if(/temporarily unavailable/.test(unknownReply)){assert.equal(await resetResponse('test-member@example.test'),unknownReply);pass('Recovery response is identical for known and unknown emails (email provider not configured locally)');}
 else pass('Unknown email receives the non-enumerating recovery response');
 writeFileSync('docs/membership-review/extra-browser-results.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));
}finally{await browser.close()}
