import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load, json } from './helpers/load.mjs';
import * as fx from './helpers/fixture.mjs';

const { normaliseType } = await load('resource-type');
const { pathModules, pathUnits, currentUnit, currentWeek, projectedFinish, nextInWeek, weekOfUnit } = await load('path');
const { initialState } = await load('planner');
const dir = 'src/content/v2';
const modules = fs
  .readdirSync(`${dir}/modules`)
  .filter(f => /^M\d+\.json$/.test(f))
  .sort()
  .map(f => json(`${dir}/modules/${f}`));
const TRACKS = ['ai-engineer', 'fde', 'mlops'];
const REF_TYPES = ['course', 'video', 'book', 'doc', 'article', 'paper', 'repo'];
const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;

// Real-content contract (docs/v2-content-schema.md). Fix the data in data/v2 and
// re-run `npm run sync-content` when this fails; do not loosen the checks.
test('v2 content matches the shared contract (docs/v2-content-schema.md)', () => {
  const moduleIds = modules.map(m => m.id);
  assert.deepEqual(moduleIds, Array.from({ length: moduleIds.length }, (_, i) => `M${String(i).padStart(2, '0')}`), 'modules are M00…Mnn with no gaps');
  const units = new Map();
  const order = new Map();
  const topicIds = new Set();
  const problems = [];
  const check = (ok, msg) => ok || problems.push(msg);
  const checkRef = (r, where) => {
    check(r && nonEmpty(r.title) && /^https?:\/\//.test(r.url ?? ''), `${where}: title + http(s) url`);
    check(r && REF_TYPES.includes(r.type), `${where}: type ${r?.type}`);
    check(r && [true, 'audit', 'partial'].includes(r.free), `${where}: free`);
    check(r && nonEmpty(r.verified), `${where}: verified`);
  };
  for (const m of modules) {
    for (const k of ['id', 'phase', 'title', 'summary', 'hours', 'prerequisites', 'tracks', 'submodules', 'capstone']) check(k in m, `${m.id}.${k} missing`);
    check(m.prerequisites.every(p => moduleIds.includes(p)), `${m.id}: unknown module prerequisite`);
    check([...m.tracks, ...(m.optionalFor ?? [])].every(t => TRACKS.includes(t)), `${m.id}: unknown track`);
    check(m.capstone.rubric.length && m.capstone.rubric.every(r => nonEmpty(r.criterion) && r.levels.length), `${m.id}: capstone rubric`);
    check(['github', 'url', 'text'].includes(m.capstone.evidence), `${m.id}: capstone evidence`);
    for (const s of m.submodules)
      for (const u of s.units) {
        check(!units.has(u.id), `duplicate unit ${u.id}`);
        check(u.id.startsWith(`${m.id}.U`), `${u.id} is not in ${m.id}`);
        units.set(u.id, u);
        order.set(u.id, order.size);
        for (const k of ['title', 'hours', 'depth', 'prerequisites', 'outcomes', 'topics', 'learn', 'covers', 'practice', 'quiz']) check(k in u, `${u.id}.${k} missing`);
        check(['core', 'deep'].includes(u.depth), `${u.id}: depth`);
        check(u.hours > 0 && u.outcomes.length && u.covers.length && u.topics.length, `${u.id}: hours/outcomes/covers/topics`);
        for (const t of u.topics) {
          check(!topicIds.has(t.id), `duplicate topic ${t.id}`);
          topicIds.add(t.id);
        }
        checkRef(u.learn, `${u.id}.learn`);
        if (u.read) checkRef(u.read, `${u.id}.read`);
        if (u.backup) checkRef(u.backup, `${u.id}.backup`);
        (u.gaps ?? []).forEach((g, i) => (check(nonEmpty(g.topic), `${u.id}.gaps[${i}].topic`), checkRef(g.resource, `${u.id}.gaps[${i}]`)));
        check(nonEmpty(u.practice.title) && nonEmpty(u.practice.brief) && nonEmpty(u.practice.done_when), `${u.id}: practice title/brief/done_when`);
        const qids = new Set();
        for (const q of u.quiz) {
          check(nonEmpty(q.id) && !qids.has(q.id), `${u.id}: question id ${q.id}`);
          qids.add(q.id);
          check(nonEmpty(q.prompt), `${q.id}: prompt`);
          if (q.kind === 'mcq') {
            check(Array.isArray(q.options) && q.options.length >= 2 && q.options.every(nonEmpty), `${q.id}: options`);
            check(new Set(q.options).size === q.options.length, `${q.id}: duplicate options`);
            check(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${q.id}: answer index in range`);
            check(nonEmpty(q.explain), `${q.id}: explain`);
          } else if (q.kind === 'short') {
            check(Array.isArray(q.rubric) && q.rubric.length >= 1 && q.rubric.every(nonEmpty), `${q.id}: rubric`);
          } else check(false, `${q.id}: kind ${q.kind}`);
        }
        check(u.quiz.filter(q => q.kind === 'mcq').length >= 3 && u.quiz.some(q => q.kind === 'short'), `${u.id}: ≥3 MCQ + ≥1 short`);
      }
  }
  // Prerequisites exist, have no cycles, and inside a module come before the unit.
  for (const [id, u] of units)
    for (const p of u.prerequisites) {
      check(units.has(p), `${id}: unknown prerequisite ${p}`);
      if (p.split('.')[0] === id.split('.')[0]) check(order.get(p) < order.get(id), `${id}: prerequisite ${p} comes after it in the module`);
    }
  const state = new Map();
  const visit = id => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) return check(false, `prerequisite cycle through ${id}`);
    state.set(id, 1);
    for (const p of units.get(id)?.prerequisites ?? []) if (units.has(p)) visit(p);
    state.set(id, 2);
  };
  for (const id of units.keys()) visit(id);
  assert.deepEqual(problems, []);
  assert.ok(units.size >= 200, `full curriculum bundled (${units.size} units)`);
});

test('weekly plan: consecutive weeks, real units, prerequisites never scheduled later, every core unit planned', () => {
  const units = new Map(modules.flatMap(m => m.submodules.flatMap(s => s.units)).map(u => [u.id, u]));
  const weeks = json(`${dir}/weeks.json`);
  assert.deepEqual(weeks.map(w => w.week), weeks.map((_, i) => i + 1));
  const first = new Map();
  const problems = [];
  for (const w of weeks) {
    if (!(nonEmpty(w.title) && w.hours > 0 && w.units.length)) problems.push(`week ${w.week}: title/hours/units`);
    for (const id of w.units) {
      if (!units.has(id)) problems.push(`week ${w.week} → unknown ${id}`);
      if (!first.has(id)) first.set(id, w.week);
    }
    if (w.allocation && !Object.keys(w.allocation).every(id => w.units.includes(id) || /^M\d+-capstone$/.test(id))) problems.push(`week ${w.week}: allocation names a unit not in the week`);
    if (w.detail && !(Array.isArray(w.detail) && w.detail.every(nonEmpty))) problems.push(`week ${w.week}: detail lines`);
  }
  for (const [id, wk] of first)
    for (const p of units.get(id)?.prerequisites ?? [])
      if (first.has(p) && first.get(p) > wk) problems.push(`${id} (week ${wk}) needs ${p} (week ${first.get(p)})`);
  for (const [id, u] of units) {
    if (u.depth === 'core' && !first.has(id)) problems.push(`core unit ${id} is in no week`);
    if (u.week != null && u.week !== first.get(id)) problems.push(`${id}.week ${u.week} ≠ first planned week ${first.get(id)}`);
  }
  assert.deepEqual(problems, []);
});

test('tracks, resources and legacy map are consistent with the modules', () => {
  const ids = new Set(modules.map(m => m.id));
  const tracks = json(`${dir}/tracks.json`);
  assert.deepEqual(tracks.map(t => t.id).sort(), [...TRACKS].sort());
  for (const t of tracks) {
    assert.ok(t.moduleOrder.every(id => ids.has(id)), `${t.id}: unknown module`);
    assert.equal(new Set(t.moduleOrder).size, t.moduleOrder.length, `${t.id}: duplicate module`);
    for (const m of modules) if (m.tracks.includes(t.id)) assert.ok(t.moduleOrder.includes(m.id), `${t.id} misses core ${m.id}`);
  }
  const resources = json(`${dir}/resources.json`);
  assert.equal(new Set(resources.map(r => r.id)).size, resources.length, 'resource ids unique');
  for (const r of resources) {
    assert.ok(['course', 'book', 'video', 'paper', 'doc', 'repo'].includes(r.type), `${r.id}: type ${r.type}`);
    assert.ok(nonEmpty(r.title) && /^https?:\/\//.test(r.url), `${r.id}: title/url`);
  }
  assert.ok(resources.filter(r => r.type === 'book').length >= 38, 'books are typed "book" for the Books tab');
  const topicIds = new Set(modules.flatMap(m => m.submodules.flatMap(s => s.units.flatMap(u => u.topics.map(t => t.id)))));
  const legacy = json(`${dir}/legacy-map.json`);
  const bad = Object.entries(legacy).filter(([, v]) => v !== null && !topicIds.has(v));
  assert.deepEqual(bad, [], 'every legacy-map target is a real v2 topic');
  const unmapped = json('src/content/topic-index.json').filter(t => !(t.id in legacy)).map(t => t.id);
  assert.deepEqual(unmapped, [], 'every legacy topic has an explicit mapping (or null)');
});

test('placement over the real content covers every module with up to three questions each', async () => {
  const { buildPlacement } = await load('placement');
  const qs = buildPlacement(modules);
  assert.deepEqual([...new Set(qs.map(q => q.module))], modules.map(m => m.id));
  for (const m of modules) {
    const n = qs.filter(q => q.module === m.id).length;
    assert.ok(n >= 2 && n <= 3, `${m.id}: ${n} questions`);
  }
});

test('Books tab: legacy "book-or-reference" entries and books.json normalise to type "book"', () => {
  const legacy = json('src/content/resources.json');
  assert.ok(legacy.some(r => r.type === 'book-or-reference'), 'root cause: legacy type label');
  assert.equal(normaliseType('book-or-reference'), 'book');
  assert.equal(normaliseType('book'), 'book');
  assert.equal(normaliseType('paper'), 'paper');
  assert.ok(json('src/content/books.json').length >= 10);
});

test('path: role order, current unit skips locked units, current week and projected finish', () => {
  const ordered = pathModules(fx.modules, fx.tracks, 'ai-engineer');
  assert.deepEqual(ordered.map(m => m.id), ['M00', 'M01']);
  assert.deepEqual(pathModules(fx.modules, fx.tracks, 'mlops').map(m => m.id), ['M01', 'M00']);
  assert.deepEqual(pathModules(fx.modules, fx.tracks, 'undecided').map(m => m.id), ['M00', 'M01']);
  const units = pathUnits(ordered);
  assert.equal(units.length, 6);
  assert.equal(pathUnits(ordered, false).length, 5, 'deep units can be left out');
  const known = new Set(fx.units.map(u => u.id));
  const s = initialState();
  assert.equal(currentUnit(units, s, known).unit.id, 'M00.U01');
  s.units = { 'M00.U01': { steps: {}, attempts: [], short: {}, passedAt: 'Tue 2026-10-20 5:00 AM PKT (UTC+05:00)' } };
  assert.equal(currentUnit(units, s, known).unit.id, 'M00.U02');
  assert.equal(currentWeek(fx.weeks, s).week, 2);
  // MLOps order puts M01 first, but M01.U01 needs M00.U02: the next open unit is in M00.
  const mlops = pathUnits(pathModules(fx.modules, fx.tracks, 'mlops'));
  assert.equal(currentUnit(mlops, initialState(), known).unit.id, 'M00.U01');
  assert.equal(nextInWeek(fx.weeks[1], units, s, known).unit.id, 'M00.U02');
  assert.equal(weekOfUnit(fx.weeks).get('M01.U01'), 2);
  assert.equal(projectedFinish(20, 8, new Date(2026, 0, 1)).weeks, 3);
});
