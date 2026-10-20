import test from 'node:test';
import assert from 'node:assert/strict';
import { load, json } from './helpers/load.mjs';

const a = await load('assess');
const { initialState } = await load('planner');
const M00 = json('src/content/v2/modules/M00.json');
const M01 = json('src/content/v2/modules/M01.json');
const units = [M00, M01].flatMap(m => m.submodules.flatMap(s => s.units));
const known = new Set(units.map(u => u.id));
const u1 = units.find(u => u.id === 'M00.U01');
const u2 = units.find(u => u.id === 'M00.U02');

test('MCQ grading: score, 80% pass mark, unanswered counts as wrong, explanations returned', () => {
  const qs = a.mcqOf(u1.quiz);
  assert.equal(qs.length, 3);
  const all = a.gradeMcq(qs, qs.map(q => q.answer));
  assert.deepEqual([all.score, all.max, all.passed], [3, 3, true]);
  const two = a.gradeMcq(qs, [qs[0].answer, qs[1].answer, undefined]);
  assert.equal(two.score, 2);
  assert.equal(two.passed, false, '2/3 = 67% is below 80%');
  assert.equal(two.results[2].correct, false);
  assert.ok(two.results[2].explain.length > 0);
  const five = Array.from({ length: 5 }, (_, i) => ({ id: `q${i}`, kind: 'mcq', prompt: '', options: ['a', 'b'], answer: 0, explain: '' }));
  assert.equal(a.gradeMcq(five, [0, 0, 0, 0, 1]).passed, true, '4/5 = 80% passes');
  assert.equal(a.gradeMcq([], []).passed, false);
});

test('short answers need real text and two of three rubric points', () => {
  const q = a.shortOf(u1.quiz)[0];
  assert.equal(a.shortThreshold(q.rubric), 2);
  assert.equal(a.shortPassed(q, { text: 'too short', checks: [true, true, true] }), false);
  const text = 'The editor is where I write files; the terminal runs them.';
  assert.equal(a.shortPassed(q, { text, checks: [true, false, false] }), false);
  assert.equal(a.shortPassed(q, { text, checks: [true, false, true] }), true);
  assert.equal(a.shortThreshold(['a', 'b', 'c', 'd']), 3);
});

test('a unit passes only with evidence + MCQ ≥ 80% + self-checked short answers', () => {
  const work = a.emptyUnitWork();
  assert.equal(a.missingForPass(u1, work).length, 3);
  work.evidence = 'https://github.com/me/learning';
  work.attempts.push({ at: '2026-10-20T10:00:00.000Z', score: 2, max: 3, answers: [] });
  assert.equal(a.canPass(u1, work), false);
  work.attempts.push({ at: '2026-10-20T11:00:00.000Z', score: 3, max: 3, answers: [] });
  assert.equal(a.missingForPass(u1, work).length, 1, 'best attempt counts');
  const q = a.shortOf(u1.quiz)[0];
  work.short[q.id] = { text: 'The editor saves source; the terminal runs programs.', checks: [true, true, false], at: '2026-10-20T11:05:00.000Z' };
  assert.equal(a.canPass(u1, work), true);
});

test('unit status: locked → available → in-progress → passed; tested-out counts as passed', () => {
  const s = initialState();
  assert.equal(a.unitStatus(u1, s, known), 'available');
  assert.equal(a.unitStatus(u2, s, known), 'locked');
  s.units = { 'M00.U02': { ...a.emptyUnitWork(), evidence: 'Started practising early' } };
  assert.equal(a.unitStatus(u2, s, known), 'locked', 'work ahead stays locked until prerequisites pass');
  s.units['M00.U01'] = { ...a.emptyUnitWork(), passedAt: '2026-10-20T12:00:00.000Z' };
  assert.equal(a.unitStatus(u1, s, known), 'passed');
  assert.equal(a.unitStatus(u2, s, known), 'in-progress');
  const fresh = initialState();
  fresh.profile = { track: 'fde', level: 'developer', hoursPerWeek: 8, testedOut: ['M00.U01'], startedAt: '2026-10-20T12:00:00.000Z', onboarded: true };
  assert.equal(a.unitStatus(u1, fresh, known), 'passed');
  assert.equal(a.unitStatus(u2, fresh, known), 'available');
  const orphan = { ...u2, prerequisites: ['M99.U01'] };
  assert.equal(a.unitStatus(orphan, initialState(), known), 'available', 'unknown prerequisites never lock');
});

test('step fraction tracks Learn / Read / Practice / Assess', () => {
  const s = initialState();
  assert.equal(a.stepFraction(u1, s), 0);
  s.units = { 'M00.U01': { ...a.emptyUnitWork(), steps: { learn: '2026-10-20T10:00:00.000Z' }, evidence: 'my notes here' } };
  assert.equal(a.stepFraction(u1, s), 0.5);
});

test('placement tests out a module only when every question for it is right', async () => {
  const { placementQuestions, placementResult } = await load('placement');
  const right = placementQuestions.map(q => (q.module === 'M00' ? q.answer : -1));
  const r = placementResult(right, [M00, M01]);
  assert.deepEqual(r.testedOutModules, ['M00']);
  assert.deepEqual(r.testedOut, ['M00.U01', 'M00.U02']);
  const partial = placementQuestions.map(q => (q.id === 'P1' ? q.answer : -1));
  assert.deepEqual(placementResult(partial, [M00, M01]).testedOut, []);
});
