import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {createClient} from '@supabase/supabase-js';
const credentials=JSON.parse(fs.readFileSync('.env.auth-test.local','utf8'));
assert.match(credentials.email,/\+grain-test@gmail\.com$/,'Only a dedicated test account may be modified');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()];}));
const api=createClient(env.EXPO_PUBLIC_SUPABASE_URL,env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const login=await api.auth.signInWithPassword(credentials);assert.equal(login.error,null,login.error?.message);
const userId=login.data.user.id,key=`ai-learning-account:${userId}`;
const before=await api.from('learning_notebooks').select('revision,payload').eq('user_id',userId).maybeSingle();assert.equal(before.error,null);
const base=process.env.PREVIEW_URL??'https://ai-engineering-grain-to-mountain.vercel.app';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[];
async function open(width){const context=await browser.newContext({viewport:{width,height:950}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/account');await page.getByLabel('Email',{exact:true}).fill(credentials.email);await page.getByLabel('Password',{exact:true}).fill(credentials.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();try{await page.getByTestId('open-lesson').waitFor();}catch(e){console.log('Sign-in page diagnostic:',await page.locator('body').innerText());fs.mkdirSync('design/shots/account-tests',{recursive:true});await page.screenshot({path:'design/shots/account-tests/signin-failure.png',fullPage:true});throw e;}await page.goto(base+'/account');await page.getByText('Sync: Up to date',{exact:true}).waitFor();await page.goto(base+'/session/D001');await page.getByLabel('Lesson evidence').waitFor();return {context,page};}
async function save(page,evidence){await page.getByLabel('Lesson evidence').fill(evidence);await page.getByRole('button',{name:'Save notes',exact:true}).click();await page.getByRole('button',{name:'Notes saved',exact:true}).waitFor();await page.waitForFunction(({key,evidence})=>JSON.parse(localStorage.getItem(key))?.state.lessons.D001?.evidence===evidence,{key,evidence});}
async function clean(page){await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key))?.dirty===false,key);}
try{
 const a=await open(1440),b=await open(390);
 await save(a.page,'Browser A saved this integration note.');await clean(a.page);
 await b.page.goto(base+'/account');await b.page.getByRole('button',{name:'Sync now',exact:true}).click();await b.page.getByText('Sync: Up to date',{exact:true}).waitFor();await b.page.goto(base+'/session/D001');await b.page.waitForFunction(()=>document.querySelector('[aria-label="Lesson evidence"]')?.value==='Browser A saved this integration note.');
 await a.context.setOffline(true);await save(a.page,'Offline browser A edit is preserved locally.');
 await save(b.page,'Online browser B edit should win by explicit choice.');await clean(b.page);
 await a.context.setOffline(false);await a.page.goto(base+'/account');await a.page.getByRole('button',{name:'Sync now',exact:true}).click();await a.page.getByText('Choose the notebook to continue with',{exact:true}).waitFor();await a.page.getByRole('button',{name:'Use cloud version on this device',exact:true}).click();await a.page.getByText('Sync: Up to date',{exact:true}).waitFor();await a.page.goto(base+'/session/D001');await a.page.waitForFunction(()=>document.querySelector('[aria-label="Lesson evidence"]')?.value==='Online browser B edit should win by explicit choice.');
 await a.page.goto(base+'/account');await a.page.getByRole('button',{name:'Sign out on this device',exact:true}).click();await a.page.getByTestId('open-lesson').waitFor();await a.page.goto(base+'/account');await a.page.getByRole('button',{name:'Sign in',exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS live desktop/phone browser sign-in, synced notes, offline preservation, conflict selection, and sign-out to guest.');
}finally{
 await browser.close();
 const latest=await api.from('learning_notebooks').select('revision').eq('user_id',userId).single();
 if(!latest.error){const restored=await api.rpc('save_learning_notebook',{p_user_id:userId,p_revision:latest.data.revision,p_payload:before.data?.payload??{version:1,lessons:{},topics:{},verified:{}}});assert.equal(restored.error,null,'Restore the dedicated test notebook');}
 await api.auth.signOut();
}

