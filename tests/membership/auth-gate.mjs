// Local synthetic tests only. See docs/membership-review/README.md.
import { createRequire } from "node:module";
const testRequire = createRequire(new URL("../../node_modules/.cache/membership-tools/package.json", import.meta.url));
const { chromium } = testRequire('playwright');
import assert from 'node:assert/strict';

const base='http://127.0.0.1:3000';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];const pass=x=>{results.push(x);console.log('PASS',x)};
const signIn=async(page,id)=>{await page.getByLabel('Email',{exact:true}).fill(id+'@example.test');await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.waitForURL('**/welcome');await page.getByRole('button',{name:'Continue now'}).click();};
try {
 for(const [label,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]) {
  const context=await browser.newContext({viewport});const page=await context.newPage();
  for(const route of ['/','/services','/how-it-works','/privacy','/terms','/refund-policy','/community-rules','/support','/emergency-services','/join-network','/login','/forgot-password','/signup','/apply/vendor','/apply/financing']) {
   const res=await page.goto(base+route);assert.equal(res.status(),200,route);assert.equal(new URL(page.url()).pathname,route,route+' redirected');
  }
  pass(label+': public pages stay accessible to guests');
  await page.goto(base+'/');
  await page.getByRole('link',{name:'Browse all vendors'}).click();await page.waitForURL('**/login?next=*');
  assert.equal(new URL(page.url()).searchParams.get('next'),'/marketplace/vendors');
  await page.goto(base+'/services');await page.locator('a[href^="/marketplace/vendors?category="]').first().click();await page.waitForURL('**/login?next=*');
  assert.match(new URL(page.url()).searchParams.get('next'),/^\/marketplace\/vendors\?category=/);
  await page.goto(base+'/how-it-works');await page.getByRole('link',{name:'Find Vendors'}).first().click();await page.waitForURL('**/login?next=*');
  await page.goto(base+'/');await page.getByRole('link',{name:'Log In'}).click();await page.waitForURL(u=>new URL(u).pathname==='/login');
  await page.goto(base+'/');await page.getByRole('link',{name:'Join as Vendor'}).click();await page.waitForURL('**/apply/vendor');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  pass(label+': guest protected buttons go to Sign In with return path; sign-in/join links untouched');
  if(label==='mobile'){
   await page.goto(base+'/');
   // Mirrors the markup SeasonalExperience renders when an admin-uploaded effect is active.
   await page.evaluate(()=>{const fx=document.createElement('div');fx.className='seasonal-custom-effect';fx.setAttribute('aria-hidden','true');fx.innerHTML='<img alt="" style="background:red">';document.querySelector('.seasonal-experience').prepend(fx);});
   const fx=await page.locator('.seasonal-custom-effect').evaluate(el=>{const s=getComputedStyle(el);return {position:s.position,z:s.zIndex,pe:s.pointerEvents}});
   assert.deepEqual(fx,{position:'fixed',z:'0',pe:'none'});
   const hit=await page.evaluate(()=>{const h=document.querySelector('h1').getBoundingClientRect();return document.elementFromPoint(h.left+5,h.top+5)?.closest('.seasonal-custom-effect')===null});
   assert.ok(hit,'seasonal layer captured a click');
   pass('mobile: seasonal media layer is fixed behind content and never captures clicks');
   for(const [name,path] of [['Become a Vendor','/apply/vendor'],['Become a Financing Partner','/apply/financing'],['Sign In','/login'],['Join SturdiHome','/join-network']]){
    await page.goto(base+'/');await page.getByRole('button',{name:'Open menu'}).click();
    await page.locator('header .md\\:hidden').getByRole('link',{name,exact:true}).click();await page.waitForURL(u=>new URL(u).pathname===path);
   }
   await page.goto(base+'/');await page.getByRole('button',{name:'Open menu'}).click();await page.getByRole('button',{name:'Close menu'}).click();
   pass('mobile: menu opens, closes and every menu link is clickable above page content');
  }
  await context.close();
 }
 const direct=await browser.newPage();await direct.goto(base+'/member');assert.equal(new URL(direct.url()).pathname,'/join-network');await direct.close();
 pass('Direct protected URL still enforced server-side');
 for(const [id,expect,viewport] of [['test-member','/marketplace/vendors',{width:390,height:844}],['test-vendor','/marketplace/vendors',{width:1280,height:900}],['test-finance','/marketplace/vendors',{width:390,height:844}]]) {
  const context=await browser.newContext({viewport});const page=await context.newPage();
  await page.goto(base+'/');await page.getByRole('link',{name:'Browse all vendors'}).click();await page.waitForURL('**/login?next=*');
  await signIn(page,id);await page.waitForURL(u=>new URL(u).pathname===expect);
  await page.goto(base+'/');await page.getByRole('link',{name:'Browse all vendors'}).click();await page.waitForURL(u=>new URL(u).pathname==='/marketplace/vendors');
  await page.getByRole('heading',{name:'Test Plumbing'}).waitFor();
  pass(id+': returns to requested action after sign-in and is not re-gated');
  await context.close();
 }
 const admin=await browser.newContext({viewport:{width:1280,height:900}});const ap=await admin.newPage();
 await ap.goto(base+'/login');await signIn(ap,'test-admin');await ap.waitForURL('**/admin');
 await ap.goto(base+'/');await ap.getByRole('link',{name:'Browse all vendors'}).click();await ap.waitForURL(u=>new URL(u).pathname==='/marketplace/vendors');
 const r=await ap.goto(base+'/admin/members');assert.equal(r.status(),200);assert.equal(new URL(ap.url()).pathname,'/admin/members');
 pass('Admin: not gated, admin access unchanged');await admin.close();
}finally{await browser.close()}
