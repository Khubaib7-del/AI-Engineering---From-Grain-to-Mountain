import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright-core';
import {createClient} from '@supabase/supabase-js';
const credentials=JSON.parse(fs.readFileSync('.env.native-test.local','utf8'));
assert.match(credentials.email,/\+grain-native-\d+@gmail\.com$/,'Use only a disposable native fixture');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()];}));
const api=createClient(env.EXPO_PUBLIC_SUPABASE_URL,env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(u,o)=>fetch(u,{...o,signal:AbortSignal.timeout(20000)})}});
const login=await api.auth.signInWithPassword(credentials);assert.equal(login.error,null);
const userId=login.data.user.id;
const adb=(...args)=>{try{return execFileSync('adb',args,{encoding:'utf8',timeout:30000,windowsHide:true});}catch(e){throw new Error(`ADB command failed (exit ${e.status??'timeout'}); arguments omitted to protect test credentials.`);}};
assert.match(adb('devices'),/emulator-\d+\s+device/,'Use an isolated emulator, never a personal phone');
const serial=adb('devices').match(/(emulator-\d+)\s+device/)[1];
const shell=(...args)=>adb('-s',serial,'shell',...args);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const decode=s=>s.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function nodes(){
 const dumped=shell('uiautomator','dump','/sdcard/grain-test-ui.xml');
 if(!dumped.includes('dumped to:'))return []; // Never reuse a stale tree during cold launch.
 return [...shell('cat','/sdcard/grain-test-ui.xml').matchAll(/<node\s+([^>]+)>?/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],decode(a[2])])));
}
async function waitFor(label,{scroll=false,timeout=60000}={}){
 const end=Date.now()+timeout;
 do{
  const all=nodes().filter(n=>n.bounds!=='[0,0][0,0]');
  const node=all.find(n=>n['content-desc']===label)??all.find(n=>n.text===label);
  if(node)return node;
  if(scroll)shell('input','swipe','540','1900','540','700','350');
  await sleep(700);
 }while(Date.now()<end);
 throw new Error(`Android did not show: ${label}`);
}
async function tap(label,options){const n=await waitFor(label,options),b=n.bounds.match(/\d+/g).map(Number);shell('input','tap',String((b[0]+b[2])>>1),String((b[1]+b[3])>>1));await sleep(500);}
async function input(label,text,{scroll=false}={}){
 await tap(label,{scroll});shell('input','keyevent','KEYCODE_MOVE_END');shell('input','keycombination','113','29');shell('input','text',text.replace(/ /g,'%s'));
 // Escape does not dismiss Gboard on this emulator; tapping through it hits keys.
 if(/mInputShown=true/.test(shell('dumpsys','input_method')))shell('input','keyevent','4');
 await sleep(700);
}
async function route(path){shell('am','start','-a','android.intent.action.VIEW','-d',`ai-learning://${path}?test_route=${Date.now()}`,'com.khubaib.ailearning');await sleep(1500);}
async function note(value){await route('session/D001');await input('Lesson evidence',value,{scroll:true});await tap('Save notes',{scroll:true});await waitFor('Notes saved');}
async function seen(value){await route('session/D001');await waitFor('Lesson evidence',{scroll:true});assert.ok(nodes().some(n=>n['content-desc']==='Lesson evidence'&&n.text===value),`Android note did not match ${value}`);}
async function cloudNote(value){for(let i=0;i<30;i++){const {data,error}=await api.from('learning_notebooks').select('payload').eq('user_id',userId).maybeSingle();assert.equal(error,null);if(data?.payload.lessons.D001?.evidence===value)return;await sleep(1000);}throw new Error('Android note did not reach cloud');}
async function sync(){await route('account');await tap('Sync now');await waitFor('Sync: Up to date');}
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:950}}),page=await context.newPage();
const base=process.env.PREVIEW_URL??'https://ai-engineering-grain-to-mountain.vercel.app';
async function webNote(value){await page.goto(base+'/session/D001');await page.getByLabel('Lesson evidence').fill(value);await page.getByRole('button',{name:'Save notes',exact:true}).click();await page.getByRole('button',{name:'Notes saved',exact:true}).waitFor();await cloudNote(value);}
try{
 if(process.argv.includes('--seed-guest')){
  await note('Guest note survives app update.');console.log('PASS old APK guest notebook seeded for upgrade test');
 }else if(process.argv.includes('--account-exit')){
  await route('account');
  if(!nodes().some(n=>n.text==='Your account')){await input('Email',credentials.email);await input('Password',credentials.password);await tap('Sign in');await waitFor('Open lesson');}
  await route('account');await tap('Sign out on this device',{scroll:true});await waitFor('Open lesson');
  await route('account');await waitFor('Sign in');await seen('Guest note survives app update.');await route('account');
  fs.mkdirSync('design/shots/android-sync',{recursive:true});shell('screencap','-p','/sdcard/grain-account.png');adb('-s',serial,'pull','/sdcard/grain-account.png','design/shots/android-sync/account.png');
  console.log('PASS completed native sign-in/sign-out and original guest notebook preserved');
 }else{
 await route('account');
 // An existing test-session may be reused after a failed assertion.
 if(!nodes().some(n=>n.text==='Your account')){
  await input('Email',credentials.email);await input('Password',credentials.password);await tap('Sign in');await waitFor('Open lesson');
 }
 await sync();console.log('PASS native sign-in and hosted sync');
 await tap('Review guest import',{scroll:true});await tap('Replace account notebook with guest progress',{scroll:true});await cloudNote('Guest note survives app update.');console.log('PASS old APK guest data preserved and imported only by explicit choice');
 await page.goto(base+'/account');await page.getByLabel('Email',{exact:true}).fill(credentials.email);await page.getByLabel('Password',{exact:true}).fill(credentials.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByTestId('open-lesson').waitFor();
 await page.goto(base+'/account');await page.getByText('Sync: Up to date',{exact:true}).waitFor();
 await webNote('Web wrote this note for Android.');await sync();await seen('Web wrote this note for Android.');console.log('PASS web to Android');
 await note('Android wrote this note for web.');await cloudNote('Android wrote this note for web.');await page.goto(base+'/account');await page.getByRole('button',{name:'Sync now',exact:true}).click();await page.getByText('Sync: Up to date',{exact:true}).waitFor();await page.goto(base+'/session/D001');await page.waitForFunction(()=>document.querySelector('[aria-label="Lesson evidence"]')?.value==='Android wrote this note for web.');console.log('PASS Android to web');
 shell('am','force-stop','com.khubaib.ailearning');await route('account');await waitFor(credentials.email);await waitFor('Sync: Up to date');console.log('PASS encrypted sign-in survives cold launch');
 shell('cmd','connectivity','airplane-mode','enable');shell('svc','wifi','disable');shell('svc','data','disable');await note('Offline Android note survives restart.');
 shell('am','force-stop','com.khubaib.ailearning');await seen('Offline Android note survives restart.');console.log('PASS offline SQLite note and session survive cold launch');
 await webNote('Web changed while Android was offline.');shell('cmd','connectivity','airplane-mode','disable');shell('svc','wifi','enable');shell('svc','data','enable');
 await route('account');await tap('Sync now');await waitFor('Choose the notebook to continue with',{scroll:true});await tap('Use cloud version on this device',{scroll:true});await waitFor('Sync: Up to date');await seen('Web changed while Android was offline.');console.log('PASS concurrent offline edits require explicit conflict selection');
 await route('account');await tap('Sign out on this device',{scroll:true});await waitFor('Open lesson');await route('account');await waitFor('Sign in');console.log('PASS native sign-out returns to guest');
 await seen('Guest note survives app update.');console.log('PASS account edits did not replace original guest notebook');await route('account');
 fs.mkdirSync('design/shots/android-sync',{recursive:true});adb('-s',serial,'shell','screencap','-p','/sdcard/grain-account.png');adb('-s',serial,'pull','/sdcard/grain-account.png','design/shots/android-sync/account.png');
 console.log('PASS Android/web end-to-end sync; fixture account only.');
 }
}finally{
 shell('cmd','connectivity','airplane-mode','disable');shell('svc','wifi','enable');shell('svc','data','enable');await browser.close();await api.auth.signOut();
}
