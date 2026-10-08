import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
const code=ts.transpile(fs.readFileSync('src/lib/secure-session.ts','utf8'),{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022});
const {secureSessionStorage}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
function fixture(){
 const values=new Map();let failure='';
 const storage=secureSessionStorage({getItemAsync:async k=>values.get(k)??null,setItemAsync:async(k,v)=>{if(k===failure)throw new Error('disk full');assert.ok(Buffer.byteLength(v)<2048);values.set(k,v);},deleteItemAsync:async k=>{values.delete(k);}});
 return {values,storage,fail:k=>{failure=k;}};
}
test('large Unicode sessions survive refresh and sign-out clears encrypted parts',async()=>{
 const {values,storage}=fixture();
 const session=JSON.stringify({token:'x'.repeat(6000),name:'🙂'.repeat(900)});
 await storage.setItem('auth',session);assert.equal(await storage.getItem('auth'),session);
 await storage.setItem('auth','refreshed');assert.equal(await storage.getItem('auth'),'refreshed');
 assert.equal(values.size,2);await storage.removeItem('auth');assert.equal(values.size,0);
});
test('failed session refresh preserves committed token, including failed manifest writes',async()=>{
 const {values,storage,fail}=fixture();await storage.setItem('auth','original');
 fail('auth.part.1.1');await assert.rejects(storage.setItem('auth','x'.repeat(900)));assert.equal(await storage.getItem('auth'),'original');
 fail('auth');await assert.rejects(storage.setItem('auth','replacement'));assert.equal(await storage.getItem('auth'),'original');assert.equal(values.size,2);
});
test('old direct sessions migrate; missing encrypted parts fail rather than restoring a partial token',async()=>{
 const {values,storage}=fixture();values.set('auth','legacy');assert.equal(await storage.getItem('auth'),'legacy');
 await storage.setItem('auth','new');values.delete('auth.part.0.0');await assert.rejects(storage.getItem('auth'),/incomplete/);
});
