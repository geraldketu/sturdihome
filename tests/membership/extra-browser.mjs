// Local synthetic tests only. See docs/membership-review/README.md.
import { createRequire } from "node:module";
const testRequire = createRequire(new URL("../../node_modules/.cache/membership-tools/package.json", import.meta.url));
﻿const { chromium } = testRequire('playwright');
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const base='http://127.0.0.1:3000';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];const pass=x=>{results.push(x);console.log('PASS',x)};
try {
 for(const role of ['vendor','financing']) {
 const context=await browser.newContext({viewport:{width:320,height:800}});const page=await context.newPage();
 await page.goto(base+'/apply/'+role);
 await page.getByLabel('Contact Name',{exact:true}).fill('New '+role);await page.getByLabel('Email',{exact:true}).fill(role+'-'+Date.now()+'@example.test');await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByLabel('Company Name',{exact:true}).fill('Synthetic '+role);
 if(role==='vendor'){await page.getByLabel('Service Area',{exact:true}).fill('Atlanta');await page.getByLabel('Services Offered',{exact:true}).fill('Plumbing');}else await page.locator('[name="licenseInfo"]').fill('Synthetic test license');
 await page.getByRole('button',{name:'Submit Application',exact:true}).click();await page.waitForURL('**/welcome');
 assert.equal(await page.locator('h1').innerText(),'Welcome to SturdiHome! ❤️');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.match(await page.locator('main').innerText(),role==='vendor'?/as a vendor/:/as a finance partner/);
 await page.screenshot({path:'docs/membership-review/first-'+role+'-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Continue now'}).click();await page.waitForURL('**/agreement');
 pass('First '+role+' registration has role-specific first welcome and preserves approval gate at 320px');await context.close();
 }
 const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
 await page.goto(base+'/login');await page.getByLabel('Email',{exact:true}).fill('test-admin@example.test');await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.waitForURL('**/welcome');await page.getByRole('button',{name:'Continue now'}).click();await page.waitForURL('**/admin');
 for(const path of ['/admin/members','/admin/vendors','/admin/financing-partners','/admin/documents','/admin/requests']){const r=await page.goto(base+path);assert.equal(r.status(),200);assert.equal(new URL(page.url()).pathname,path)}pass('Existing assigned admin access remains intact');
 await context.close();
 const guest=await browser.newPage({viewport:{width:390,height:844}});await guest.goto(base+'/');await guest.getByLabel('What service do you need?').selectOption('Roofing');await guest.getByLabel('City or ZIP code').fill('30301');await guest.getByRole('button',{name:'Find Vendors',exact:true}).click();await guest.waitForURL('**/join-network?next=*');assert.equal(new URL(guest.url()).searchParams.get('next'),'/marketplace/vendors?category=Roofing&location=30301');pass('Homepage search preserves service and location through membership gate');
 await guest.goto(base+'/forgot-password');await guest.getByLabel('Email',{exact:true}).fill('unknown@example.test');await guest.getByRole('button',{name:'Send reset link',exact:true}).click();await guest.getByText(/If an account matches/).waitFor();pass('Unknown email receives the same non-enumerating recovery response');
 writeFileSync('docs/membership-review/extra-browser-results.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));
}finally{await browser.close()}
