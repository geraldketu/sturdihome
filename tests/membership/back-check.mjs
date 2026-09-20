import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const testRequire = createRequire(new URL('../../node_modules/.cache/membership-tools/package.json', import.meta.url));
const { chromium } = testRequire('playwright');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage();
async function login(){
 await page.goto('http://127.0.0.1:3000/login');
 await page.getByLabel('Email',{exact:true}).fill('test-member@example.test');
 await page.getByLabel('Password',{exact:true}).fill('Review-only-Password42');
 await page.getByRole('button',{name:'Sign In',exact:true}).click();
 await page.waitForURL('**/welcome');
}
try {
 await login();
 await page.waitForTimeout(800);
 assert.equal(new URL(page.url()).pathname,'/welcome','welcome must remain visible briefly after acknowledgment');
 await page.getByRole('button',{name:'Continue now'}).click();await page.waitForURL('**/member');
 await page.goBack();assert.notEqual(new URL(page.url()).pathname,'/welcome');
 console.log('PASS completed welcome is replaced in history');
 await login();
 await page.getByRole('link',{name:'Dashboard',exact:true}).click();await page.waitForURL('**/member');
 await page.goBack();await page.waitForURL('**/member');
 assert.equal(await page.locator('.login-welcome:visible').count(),0);
 console.log('PASS leaving welcome through navigation and returning does not replay it');
}finally{await browser.close()}
