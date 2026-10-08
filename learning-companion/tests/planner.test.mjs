import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import fs from 'node:fs';
const source = fs.readFileSync('src/lib/planner.ts', 'utf8');
const compiled = ts.transpile(source, { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 });
const p = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const lessons = JSON.parse(fs.readFileSync('src/content/first-28-days.json')).days;
const modules = JSON.parse(fs.readFileSync('src/content/curriculum.json')).modules;
const topics = modules.flatMap(m => m.groups.flatMap((g, gi) => g.topics.map((_, ti) => `${m.id}.${String(gi+1).padStart(2,'0')}.${String(ti+1).padStart(2,'0')}`)));
const parse = s => p.parseBackup(JSON.stringify(s), lessons.map(l=>l.id), topics, modules.map(m=>m.id));
test('next lesson respects prerequisite evidence and all-complete ends plan', () => {
  const s=p.initialState(); assert.equal(p.availableLesson(lessons,s).id,'D001');
  s.lessons.D001={...p.emptyWork(),tasks:[true,true,true],evidence:'I wrote and ran hello.py.',completedAt:'2026-10-07T09:00:00.000Z'};
  assert.equal(p.availableLesson(lessons,s).id,'D002');
  for(const l of lessons) s.lessons[l.id]={...s.lessons.D001};
  assert.equal(p.availableLesson(lessons,s),undefined);
});
test('watching alone or empty evidence cannot complete', () => {
  const s=p.initialState(), w=p.emptyWork(); w.tasks=[true,false,false]; w.evidence='A useful explanation.';
  assert.equal(p.canComplete(lessons[0],w,s),false); w.tasks=[true,true,true]; w.evidence=''; assert.equal(p.canComplete(lessons[0],w,s),false);
  w.evidence='I ran hello.py in my terminal.'; assert.equal(p.canComplete(lessons[0],w,s),true); assert.equal(p.canComplete(lessons[1],w,s),false);
});
test('quiet hours wrap midnight and preserve end boundary',()=>{assert.equal(p.isQuiet('23:00','22:00','08:00'),true);assert.equal(p.isQuiet('07:59','22:00','08:00'),true);assert.equal(p.isQuiet('08:00','22:00','08:00'),false);assert.equal(p.isQuiet('13:00','12:00','14:00'),true);});
test('reminders skip elapsed times, quiet hours, duplicate times and nonstudy days',()=>{
  const s=p.initialState(); s.settings.reminders=true; s.settings.times=['09:00','09:00','23:00']; s.settings.weekdays=[1];
  const now=new Date(2026,9,5,10); const result=p.reminderPlan(lessons[0],s,now); assert.equal(result.length,0);
  s.settings.weekdays=[2]; const result2=p.reminderPlan(lessons[0],s,now); assert.equal(result2.length,1); assert.equal(result2[0].lessonId,'D001'); assert.equal(result2[0].date.getDay(),2); assert.deepEqual(p.reminderPlan(lessons[0],s,now),result2);
  s.settings.reminders=false;assert.deepEqual(p.reminderPlan(lessons[0],s,now),[]);
});
test('backup roundtrip, unsafe IDs and broken record rejected; imports disable notifications',()=>{
  const s=p.initialState();s.settings.reminders=true;s.topics[topics[0]]=true;const restored=parse(s);assert.equal(restored.topics[topics[0]],true);assert.equal(restored.settings.reminders,false);
  s.lessons.wrong=p.emptyWork();assert.throws(()=>parse(s),/Invalid lesson/);delete s.lessons.wrong;
  s.settings.times=['99:00'];assert.throws(()=>parse(s),/Invalid reminder/);s.settings.times=['09:00'];s.lessons.D001={...p.emptyWork(),completedAt:'2026-10-07T09:00:00.000Z'};assert.throws(()=>parse(s),/Invalid lesson/);
});
test('recall intervals end after fourth review',()=>{const w={...p.emptyWork(),completedAt:'2026-10-01T09:00:00.000Z'};assert.equal(p.reviewDue(w,new Date('2026-10-01T10:00:00Z')),false);assert.equal(p.reviewDue(w,new Date('2026-10-02T10:00:00Z')),true);w.reviews=['2026-10-02T10:00:00Z'];assert.equal(p.reviewDue(w,new Date('2026-10-03T10:00:00Z')),false);w.reviews=Array(4).fill('2026-10-15T10:00:00Z');assert.equal(p.reviewDue(w,new Date('2027-01-01')),false);});
