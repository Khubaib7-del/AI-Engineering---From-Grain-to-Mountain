import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
async function module(file){const code=ts.transpile(fs.readFileSync(file,'utf8'),{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022});return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);}
const {progressOnly,syncDecision}=await module('src/lib/sync-policy.ts');
test('offline edits cannot overwrite a newer remote notebook',()=>{
 assert.equal(syncDecision(true,4,5),'conflict');
 assert.equal(syncDecision(true,0,1),'conflict');
 assert.equal(syncDecision(true,5,5),'push');
 assert.equal(syncDecision(false,4,5),'pull');
});
test('cloud payload excludes device reminders and theme',()=>{
 const s={version:1,lessons:{D001:{evidence:'My explanation'}},topics:{a:true},verified:{},settings:{reminders:true,theme:'light'}};
 assert.deepEqual(Object.keys(progressOnly(s)).sort(),['lessons','topics','verified','version']);
 assert.equal(progressOnly(s).lessons.D001.evidence,'My explanation');
});
test('guest and two account notebooks never share a storage key',async()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const {readStored,writeStored}=await module('src/lib/storage.web.ts');
 await writeStored('guest');await writeStored('alice','alice');await writeStored('bob','bob');
 assert.equal(await readStored(),'guest');assert.equal(await readStored('alice'),'alice');assert.equal(await readStored('bob'),'bob');
 await writeStored('alice edits','alice');assert.equal(await readStored('bob'),'bob');assert.equal(await readStored(),'guest');
 assert.equal(await readStored('new-account'),null);
});
