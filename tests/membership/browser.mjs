// Local synthetic tests only. See docs/membership-review/README.md.
import { createRequire } from "node:module";
const testRequire = createRequire(new URL("../../node_modules/.cache/membership-tools/package.json", import.meta.url));
﻿const { chromium, request } = testRequire('playwright');
import assert from 'node:assert/strict';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';

const base='http://127.0.0.1:3000';
const query=async(sql,params=[])=>{const r=await fetch('http://127.0.0.1:55440',{method:'POST',body:JSON.stringify({sql,params})});if(!r.ok)throw new Error(await r.text());return r.json()};
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const visitor=await request.newContext({baseURL:base});
const results=[];
const pass=label=>{results.push(label);console.log('PASS',label)};
const out='docs/membership-review';mkdirSync(out,{recursive:true});
const allRoutes=[];
function walk(dir,route='') {for(const item of readdirSync(dir,{withFileTypes:true})) {if(item.isDirectory())walk(dir+'/'+item.name,route+'/'+item.name);else if(item.name==='page.tsx')allRoutes.push(route||'/')}}
walk('src/app');
try {
 for(const route of allRoutes.filter(r=>/^\/(member|vendor|financing|admin|marketplace)(\/|$)/.test(r))) {
   const response=await visitor.get(route.replace('[id]','listing')+'?location=Atlanta',{maxRedirects:0});
   assert.ok([307,308].includes(response.status()),route+' '+response.status());
   assert.match(response.headers().location,/\/join-network\?next=/);
 } pass('All '+allRoutes.filter(r=>/^\/(member|vendor|financing|admin|marketplace)(\/|$)/.test(r)).length+' protected page URLs reject logged-out visitors');
 for(const path of ['/api/documents/fake','/api/vendor-flyers/fake']) assert.equal((await visitor.get(path)).status(),401);
 assert.equal((await visitor.post('/api/chat',{data:{messages:[]}})).status(),401);pass('Chat and private download APIs reject unauthenticated requests');
 const publicPage=await browser.newPage({viewport:{width:390,height:844}});
 for(const route of ['/','/services','/how-it-works','/join-network','/apply/vendor','/apply/financing','/signup','/login','/forgot-password']) {
   const res=await publicPage.goto(base+route);assert.equal(res.status(),200,route);assert.equal(new URL(publicPage.url()).pathname,route,route+" was redirected");
   assert.ok(await publicPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' horizontal overflow');
 }pass('Public information, registration and recovery pages remain accessible and fit a phone');
 await publicPage.goto(base+'/services');
 const links=await publicPage.locator('a[href^="/marketplace/"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
 for(const href of new Set(links)){const r=await visitor.get(href,{maxRedirects:0});assert.equal(r.status(),307);}
 pass('Every rendered service-category link is gated');
 await publicPage.goto(base+'/marketplace/vendors?category=Plumbing&location=Atlanta');
 await publicPage.getByRole('heading',{name:'Join SturdiHome to Continue'}).waitFor();
 await publicPage.screenshot({path:out+'/join-mobile.png',fullPage:true});
 await publicPage.getByRole('link',{name:'Already a Member? Sign In'}).click();
 assert.equal(new URL(publicPage.url()).searchParams.get('next'),'/marketplace/vendors?category=Plumbing&location=Atlanta');
 await publicPage.getByLabel('Email',{exact:true}).fill('test-member@example.test');await publicPage.getByLabel('Password',{exact:true}).fill('Review-only-Password42');
 await publicPage.getByRole('button',{name:'Sign In',exact:true}).click();await publicPage.waitForURL('**/welcome');
 assert.match(await publicPage.locator('h1').innerText(),/Welcome Back, Felicia!/);
 await publicPage.screenshot({path:out+'/member-welcome-mobile.png',fullPage:true});
 await publicPage.getByRole('button',{name:'Continue now'}).click();await publicPage.waitForURL('**/marketplace/vendors?category=Plumbing&location=Atlanta');
 await publicPage.getByRole('heading',{name:'Test Plumbing'}).waitFor();pass('Member returns to selected service and location after dismissing personalized welcome');
 await publicPage.goto(base+'/welcome');assert.equal(new URL(publicPage.url()).pathname,'/marketplace/vendors');pass('Welcome cannot replay after completion');
 await publicPage.goto(base+'/vendor');assert.equal(new URL(publicPage.url()).pathname,'/member');
 await publicPage.goto(base+'/financing');assert.equal(new URL(publicPage.url()).pathname,'/member');
 await publicPage.goto(base+'/admin');assert.equal(new URL(publicPage.url()).pathname,'/member');pass('Homeowners cannot enter vendor, finance-partner or admin portals');
 await publicPage.getByRole('button',{name:'Open menu'}).click();await publicPage.getByRole('button',{name:'Sign Out',exact:true}).waitFor();
 const oldCookies=await publicPage.context().cookies();
 await publicPage.getByRole('button',{name:'Sign Out',exact:true}).click();await publicPage.waitForURL('**/login');
 await publicPage.goto(base+'/member');assert.equal(new URL(publicPage.url()).pathname,'/join-network');
 const replay=await request.newContext({baseURL:base,extraHTTPHeaders:{Cookie:oldCookies.map(c=>c.name+'='+c.value).join('; ')}});
 assert.equal((await replay.post('/api/chat',{data:{messages:[]}})).status(),401);await replay.dispose();pass('Mobile sign-out blocks pages and revokes the old cookie on the server');
 await publicPage.close();
 for(const [id,destination,title,forbidden] of [['test-vendor','/vendor','Victor','/financing'],['test-finance','/financing','Fiona','/vendor'],['test-pending','/pending-approval','Pending','/admin']]) {
   const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
   await page.goto(base+'/login?next='+encodeURIComponent(forbidden));await page.getByLabel('Email',{exact:true}).fill(id+'@example.test');await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.waitForURL('**/welcome');
   assert.match(await page.locator('h1').innerText(),new RegExp('Welcome Back, '+title));
   await page.screenshot({path:out+'/'+id+'-welcome-desktop.png',fullPage:true});
   await page.waitForURL('**'+destination,{timeout:15000});pass(id+' auto-transitions to correct experience and ignores wrong-role return URL');
   if(id!=='test-pending') {
    await page.goto(base+forbidden);assert.equal(new URL(page.url()).pathname,destination);
    for(const width of [320,390,768,1280]) {await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'dashboard width '+width)}
   }
   await context.close();
 }
 const firstContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const first=await firstContext.newPage();
 await first.goto(base+'/signup?next='+encodeURIComponent('/member/service-request'));
 const email='first-'+Date.now()+'@example.test';
 await first.getByLabel('Full Name',{exact:true}).fill('New Homeowner');await first.getByLabel('Email',{exact:true}).fill(email);await first.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await first.getByRole('button',{name:'Create Account',exact:true}).click();await first.waitForURL('**/welcome');
 assert.equal(await first.locator('h1').innerText(),'Welcome to SturdiHome! ❤️');assert.equal(await first.locator('.welcome-heart').first().evaluate(el=>getComputedStyle(el).display),'none');
 await first.getByRole('button',{name:'Continue now'}).click();await first.waitForURL('**/agreement');await first.getByRole('checkbox',{name:/I have read and agree/}).check();await first.getByRole('checkbox',{name:/I consent to electronic/}).check();await first.getByLabel('Full Legal Name',{exact:true}).fill('New Homeowner');await first.getByLabel('Electronic Signature',{exact:true}).fill('New Homeowner');await first.getByRole('button',{name:'AGREE & SIGN',exact:true}).click();await first.waitForURL('**/pending-approval');await query(`UPDATE "User" SET "approvalStatus"='APPROVED',"approvalReviewedBy"='test-admin',"approvalReviewedAt"=now() WHERE email=$1`,[email]);await first.goto(base+'/pending-approval');await first.waitForURL('**/member/service-request');pass('First signup gets first-time welcome, reduced motion and selected-service return');
 await first.getByLabel('Service Type').selectOption('Plumbing');await first.locator('textarea[name="description"]').fill('Synthetic local access-control test');
 const mutationPromise=first.waitForRequest(r=>r.method()==='POST'&&!!r.headers()['next-action']);
 await first.getByRole('button',{name:/Submit/}).click();const mutation=await mutationPromise;
 await first.getByText('Synthetic local access-control test',{exact:true}).waitFor();
 const before=(await query('SELECT count(*)::int as n FROM "ServiceRequest"'))[0].n;
 const mutationHeaders={'next-action':mutation.headers()['next-action'],'content-type':mutation.headers()['content-type'],origin:base};
 await visitor.post('/',{headers:mutationHeaders,data:mutation.postDataBuffer(),maxRedirects:0});
 assert.equal((await query('SELECT count(*)::int as n FROM "ServiceRequest"'))[0].n,before);pass('Direct logged-out server-action replay cannot create a service request');
 await first.getByRole('button',{name:'Open menu'}).click();await first.getByRole('button',{name:'Sign Out',exact:true}).click();await first.waitForURL('**/login');
 await first.getByLabel('Email',{exact:true}).fill(email);await first.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await first.getByRole('button',{name:'Sign In',exact:true}).click();await first.waitForURL('**/welcome');assert.match(await first.locator('h1').innerText(),/Welcome Back, New!/);await first.getByRole('button',{name:'Continue now'}).click();await first.waitForURL('**/member');pass('Later login switches first-time member to Welcome Back');
 const user=(await query('SELECT id FROM "User" WHERE email=$1',[email]))[0];const token=randomBytes(32).toString('hex');
 await query('INSERT INTO "PasswordReset" ("tokenHash","userId","expiresAt") VALUES ($1,$2,$3)',[createHash('sha256').update(token).digest('hex'),user.id,new Date(Date.now()+60000)]);
 const beforeResetCookies=await firstContext.cookies();
 await first.goto(base+'/reset-password?token='+token);await first.getByLabel('New password',{exact:true}).fill('Changed-Review-Password42');await first.getByLabel('Confirm password',{exact:true}).fill('Changed-Review-Password42');await first.getByRole('button',{name:'Reset password',exact:true}).click();await first.waitForURL('**/login?reset=success');
 assert.equal((await query('SELECT count(*)::int as n FROM "AuthSession" WHERE "userId"=$1',[user.id]))[0].n,0);
 await first.goto(base+'/reset-password?token='+token);await first.getByLabel('New password',{exact:true}).fill('Replay-Password42');await first.getByLabel('Confirm password',{exact:true}).fill('Replay-Password42');await first.getByRole('button',{name:'Reset password',exact:true}).click();await first.getByText(/invalid or expired/).waitFor();
 const resetReplay=await request.newContext({baseURL:base,extraHTTPHeaders:{Cookie:beforeResetCookies.map(c=>c.name+'='+c.value).join('; ')}});assert.equal((await resetReplay.get('/api/documents/fake')).status(),401);await resetReplay.dispose();pass('Password reset is single-use and revokes every existing session');
 await first.goto(base+'/login');await first.getByLabel('Email',{exact:true}).fill(email);await first.getByLabel('Password',{exact:true}).fill('Changed-Review-Password42');await first.getByRole('button',{name:'Sign In',exact:true}).click();await first.waitForURL('**/welcome');pass('New password signs in successfully');
 await firstContext.close();
 writeFileSync(out+'/browser-results.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));
 console.log('ALL PASSED',results.length);
} finally {await browser.close();await visitor.dispose();}
