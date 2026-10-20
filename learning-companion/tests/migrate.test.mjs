import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, json } from './helpers/load.mjs';
import { legacyMap as legacy } from './helpers/fixture.mjs';

const { migrateTopicIds } = await load('migrate');
const p = await load('planner');
// Logic tests use the small inline map; content.test.mjs checks the real legacy-map.json.
const index = json('src/content/topic-index.json');
const curriculum = json('src/content/curriculum.json');
const lessons = json('src/content/first-28-days.json').days;

test('topic IDs are explicit, unique and equal to the historical positional IDs', () => {
  const ids = index.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length);
  const positional = curriculum.modules.flatMap(m => m.groups.flatMap((g, gi) => g.topics.map((_, ti) => `${m.id}.${String(gi + 1).padStart(2, '0')}.${String(ti + 1).padStart(2, '0')}`)));
  assert.deepEqual(ids, positional, 'saved progress keys survive the switch to explicit IDs');
});

test('legacy-map renames ticks, archives removed topics and is idempotent', () => {
  const valid = new Set(['M00.01.06', 'M01.U01.T01', 'M01.01.01']);
  const s = p.initialState();
  s.topics = { 'M00.01.06': true, 'M01.01.03': true, 'M00.01.10': true, 'ZZ.99.99': true, 'M01.01.01': false };
  const once = migrateTopicIds(s, legacy, valid);
  assert.deepEqual(once.topics, { 'M00.01.06': true, 'M01.U01.T01': true, 'M01.01.01': false });
  assert.deepEqual(once.archivedTopics, { 'M00.01.10': true, 'ZZ.99.99': true });
  assert.equal(once.idVersion, 2);
  assert.deepEqual(migrateTopicIds(once, legacy, valid), once);
  const restored = migrateTopicIds(once, { 'ZZ.99.99': 'M01.01.01' }, valid);
  assert.equal(restored.topics['M01.01.01'], true, 'a later map entry recovers an archived tick');
  assert.equal(restored.archivedTopics['ZZ.99.99'], undefined);
});

test('an old v1 backup imports, migrates topic IDs and backfills the activity log', () => {
  const old = p.initialState();
  old.topics = { 'M01.01.03': true };
  old.lessons.D001 = { tasks: [true, true, true], evidence: 'I ran hello.py and explained it.', completedAt: '2026-10-07T09:00:00.000Z', reviews: ['2026-10-08T09:00:00.000Z'] };
  const valid = [...index.map(t => t.id), 'M01.U01.T01'];
  const restored = p.parseBackup(JSON.stringify(old), lessons.map(l => l.id), valid, curriculum.modules.map(m => m.id), legacy);
  assert.equal(restored.topics['M01.U01.T01'], true);
  assert.equal(restored.topics['M01.01.03'], undefined);
  assert.deepEqual(restored.activity.map(e => e.kind), ['lesson', 'review']);
});

test('v2 records round-trip through backup validation; bad records are rejected', () => {
  const s = p.initialState();
  s.profile = { track: 'mlops', level: 'some-python', hoursPerWeek: 8, testedOut: [], startedAt: '2026-10-20T08:00:00.000Z', onboarded: true };
  s.units = { 'M00.U01': { steps: { learn: '2026-10-20T08:10:00.000Z' }, evidence: 'link', attempts: [{ at: '2026-10-20T08:20:00.000Z', score: 3, max: 3, answers: [1, 2, 2] }], short: {}, passedAt: '2026-10-20T08:30:00.000Z' } };
  s.capstones = { M00: { url: 'https://github.com/me/x', scores: [2, 3, 2], submittedAt: '2026-10-20T09:00:00.000Z' } };
  s.activity = [{ at: '2026-10-20T08:30:00.000Z', kind: 'unit', id: 'M00.U01' }];
  const back = p.parseBackup(JSON.stringify(s), [], [], ['M00']);
  assert.deepEqual(back.units, s.units);
  assert.deepEqual(back.capstones, s.capstones);
  assert.equal(back.profile.track, 'mlops');
  assert.equal(back.activity.length, 1);
  s.units['M00.U01'].attempts[0].score = 9;
  assert.throws(() => p.parseBackup(JSON.stringify(s), [], [], ['M00']), /Invalid unit record/);
});

test('real legacy-map.json migrates every mapped v1 tick onto a real v2 topic', () => {
  const real = json('src/content/v2/legacy-map.json');
  const v2 = fs
    .readdirSync('src/content/v2/modules')
    .filter(f => /^M\d+\.json$/.test(f))
    .flatMap(f => json(`src/content/v2/modules/${f}`).submodules.flatMap(s => s.units.flatMap(u => u.topics.map(t => t.id))));
  const valid = new Set(v2);
  const s = p.initialState();
  s.topics = Object.fromEntries(index.map(t => [t.id, true]));
  const out = migrateTopicIds(s, real, valid);
  const mapped = Object.values(real).filter(Boolean);
  assert.ok(mapped.length > 0);
  for (const id of mapped) assert.equal(out.topics[id], true, `${id} ticked`);
  const removed = Object.entries(real).filter(([, v]) => v === null).map(([k]) => k);
  for (const id of removed) assert.equal(out.archivedTopics?.[id], true, `${id} archived, not dropped`);
});
