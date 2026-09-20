import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../node_modules/.cache/membership-tools/package.json',import.meta.url));
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
 for(const [account,symbol,destination] of [['member','heart','member'],['vendor','tool','vendor'],['finance','finance','financing']]) {
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
  await page.goto('http://127.0.0.1:3000/login');
  await page.getByLabel('Email',{exact:true}).fill(`test-${account}@example.test`);await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.waitForURL('**/welcome');
  const symbols=page.locator('[data-welcome-symbol]');assert.equal(await symbols.count(),5);
  assert.deepEqual(await symbols.evaluateAll(nodes=>nodes.map(n=>n.dataset.welcomeSymbol)),Array(5).fill(symbol));
  const style=await symbols.first().evaluate(el=>{const s=getComputedStyle(el);return {duration:s.animationDuration,size:s.fontSize,color:s.color}});
  assert.equal(style.duration,'4s');assert.equal(style.size,'20px');
  if(symbol==='heart') {assert.equal(await symbols.first().textContent(),'♥');assert.equal(await symbols.first().evaluate(el=>el.getAnimations()[0].effect.getKeyframes()[1].opacity),'1');}
  else assert.equal(await symbols.first().locator('svg').count(),1);
  await symbols.evaluateAll(nodes=>nodes.forEach(el=>{for(const a of el.getAnimations()){a.pause();a.currentTime=1000}}));
  await page.screenshot({path:`docs/membership-review/${account}-symbols-mobile.png`,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.waitForURL(`**/${destination}`,{timeout:15000});
  console.log('PASS',account,symbol,'5 symbols; 4s motion; 20px; mobile fit; automatic dashboard transition',style.color);
  await context.close();
 }
}finally{await browser.close()}
