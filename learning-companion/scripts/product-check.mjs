import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const configured=process.env.ACCOUNTS_CONFIGURED==='1';
const base=process.env.PREVIEW_URL??'http://127.0.0.1:8091';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 fs.mkdirSync('design/shots/product',{recursive:true});
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:950}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const [route,label] of [['/','Small steps.'],['/download','Android'],['/account',configured?'Welcome back':'Accounts are being connected'],['/today','Build a mind.']]){
   await page.goto(base+route,{waitUntil:'networkidle'});
   await page.getByText(label,{exact:false}).first().waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+' overflow');
   await page.screenshot({path:`design/shots/product/${width}-${route.slice(1)||'home'}.png`,fullPage:true});
  }
  await page.goto(base+'/account');
  assert.equal(await page.getByRole('button',{name:'Sign in',exact:true}).isDisabled(),!configured);
  await page.getByRole('button',{name:configured?'Open learning app':'Continue locally'}).click();
  await page.getByTestId('open-lesson').waitFor();
  await page.goto(base+'/download');
  await page.getByText('Coming soon',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:/download.*ios/i}).count(),0);
  assert.deepEqual(errors,[]);
  await context.close();
 }
 console.log('PASS product/mobile/desktop routes, offline guest entry, honest download states, no overflow or runtime errors');
}finally{await browser.close();}


