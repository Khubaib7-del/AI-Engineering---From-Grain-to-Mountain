import fs from 'node:fs';
import crypto from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const file='.env.native-test.local';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()];}));
const client=createClient(env.EXPO_PUBLIC_SUPABASE_URL,env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(u,o)=>fetch(u,{...o,signal:AbortSignal.timeout(20000)})}});
if(process.argv[2]==='setup'){
 if(fs.existsSync(file))throw new Error('Native test credentials already exist; use that isolated account.');
 const credentials={email:`khubaibnazeer8+grain-native-${Date.now()}@gmail.com`,password:crypto.randomBytes(24).toString('hex')};
 fs.writeFileSync(file,JSON.stringify(credentials));
 const {data,error}=await client.auth.signUp({...credentials,options:{data:{purpose:'grain-native-sync-fixture'}}});
 if(error)throw error;
 console.log(JSON.stringify({id:data.user.id,email:credentials.email,needsConfirmation:true}));
}else if(process.argv[2]==='check'){
 const credentials=JSON.parse(fs.readFileSync(file,'utf8'));
 const {data,error}=await client.auth.signInWithPassword(credentials);if(error)throw error;
 console.log('Native fixture login passed; user ID:',data.user.id);
 await client.auth.signOut();
}else throw new Error('Use setup or check. Only disposable integration accounts are supported.');
