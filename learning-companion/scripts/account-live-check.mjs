import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()];}));
const client=()=>createClient(env.EXPO_PUBLIC_SUPABASE_URL,env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const file='.env.auth-test.local';
const mode=process.argv[2];
if(mode==='signup'){
 const credentials=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{email:process.env.TEST_EMAIL??'',password:crypto.randomBytes(24).toString('base64url')};
 assert.match(credentials.email,/\+grain-test@gmail\.com$/,'Use a dedicated test alias, never a personal learning account');
 fs.writeFileSync(file,JSON.stringify(credentials),{mode:0o600});
 const {error}=await client().auth.signUp({...credentials,options:{emailRedirectTo:'https://ai-engineering-grain-to-mountain.vercel.app/account'}});
 if(error)throw new Error(`Signup failed: ${error.message}`);
 console.log('Test signup accepted. Confirm the email sent to the owner inbox; credentials remain in ignored local storage.');
}else if(mode==='sync'){
 const credentials=JSON.parse(fs.readFileSync(file,'utf8'));
 const a=client(),b=client();
 for(const c of [a,b]){const {error}=await c.auth.signInWithPassword(credentials);assert.equal(error,null,error?.message);}
 const {data:{user}}=await a.auth.getUser();
 const before=await a.from('learning_notebooks').select('revision,payload').eq('user_id',user.id).maybeSingle();assert.equal(before.error,null);
 const payload={version:1,lessons:{D001:{tasks:[true,false,false],evidence:'Live integration check: watch task saved.',reviews:[]}},topics:{},verified:{}};
 const first=await a.rpc('save_learning_notebook',{p_user_id:user.id,p_revision:before.data?.revision??0,p_payload:payload}).single();assert.equal(first.error,null,first.error?.message);
 const seen=await b.from('learning_notebooks').select('revision,payload').eq('user_id',user.id).single();assert.equal(seen.error,null);assert.deepEqual(seen.data.payload,payload);
 const stale=await b.rpc('save_learning_notebook',{p_user_id:user.id,p_revision:first.data.revision-1,p_payload:payload});assert.equal(stale.error?.code,'40001');
 const wrongOwner=await b.rpc('save_learning_notebook',{p_user_id:crypto.randomUUID(),p_revision:0,p_payload:payload});assert.equal(wrongOwner.error?.code,'42501');
 const restored=await a.rpc('save_learning_notebook',{p_user_id:user.id,p_revision:first.data.revision,p_payload:before.data?.payload??{version:1,lessons:{},topics:{},verified:{}}});assert.equal(restored.error,null);
 for(const c of [a,b])await c.auth.signOut();
 console.log('PASS actual confirmed account sign-in from two independent clients, shared snapshot, stale conflict, wrong-owner denial; test notebook restored.');
}else if(mode==='recovery'){
 const credentials=JSON.parse(fs.readFileSync(file,'utf8'));
 const {error}=await client().auth.resetPasswordForEmail(credentials.email,{redirectTo:'https://ai-engineering-grain-to-mountain.vercel.app/account'});assert.equal(error,null,error?.message);
 console.log('Password recovery request accepted; open the reset email to verify the live callback.');
}else throw Error('Use signup, sync, or recovery');
