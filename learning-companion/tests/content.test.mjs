import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, json } from './helpers/load.mjs';

const { normaliseType } = await load('resource-type');
const { pathModules, pathUnits, currentUnit, currentWeek, projectedFinish } = await load('path');
const { initialState } = await load('planner');
const dir = 'src/content/v2';
const modules = fs.readdirSync(`${dir}/modules`).filter(f => f.endsWith('.json')).map(f => json(`${dir}/modules/${f}`));

test('v2 content matches the shared contract (V2-SCHEMA.md)', () => {
  const ids = new Set();
  for (const m of modules) {
    for (const k of ['id', 'phase', 'title', 'summary', 'hours', 'prerequisites', 'tracks', 'submodules', 'capstone']) assert.ok(k in m, `${m.id}.${k}`);
    assert.ok(m.capstone.rubric.length && m.capstone.rubric.every(r => r.criterion && r.levels.length));
    for (const s of m.submodules)
      for (const u of s.units) {
        assert.ok(!ids.has(u.id), `duplicate unit ${u.id}`);
        ids.add(u.id);
        for (const k of ['title', 'hours', 'depth', 'prerequisites', 'outcomes', 'topics', 'learn', 'covers', 'practice', 'quiz']) assert.ok(k in u, `${u.id}.${k}`);
        assert.ok(u.practice.done_when, `${u.id} practice.done_when`);
        const mcq = u.quiz.filter(q => q.kind === 'mcq');
        assert.ok(mcq.length >= 3 && u.quiz.some(q => q.kind === 'short'), `${u.id}: ≥3 MCQ + ≥1 short`);
        for (const q of mcq) assert.ok(q.answer >= 0 && q.answer < q.options.length && q.explain, q.id);
      }
  }
  for (const w of json(`${dir}/weeks.json`)) for (const id of w.units) assert.ok(ids.has(id), `week ${w.week} → ${id}`);
});

test('Books tab: legacy "book-or-reference" entries and books.json normalise to type "book"', () => {
  const legacy = json('src/content/resources.json');
  assert.ok(legacy.some(r => r.type === 'book-or-reference'), 'root cause: legacy type label');
  assert.equal(normaliseType('book-or-reference'), 'book');
  assert.equal(normaliseType('book'), 'book');
  assert.equal(normaliseType('paper'), 'paper');
  assert.ok(json('src/content/books.json').length >= 10);
});

test('path: role order, current unit, current week and projected finish', () => {
  const tracks = json(`${dir}/tracks.json`);
  const ordered = pathModules(modules, tracks, 'ai-engineer');
  assert.deepEqual(ordered.map(m => m.id), ['M00', 'M01']);
  const units = pathUnits(ordered);
  const s = initialState();
  assert.equal(currentUnit(units, s).unit.id, 'M00.U01');
  s.units = { 'M00.U01': { steps: {}, attempts: [], short: {}, passedAt: '2026-10-20T00:00:00.000Z' } };
  assert.equal(currentUnit(units, s).unit.id, 'M00.U02');
  assert.equal(currentWeek(json(`${dir}/weeks.json`), s).week, 2);
  assert.equal(projectedFinish(20, 8, new Date(2026, 0, 1)).weeks, 3);
});
