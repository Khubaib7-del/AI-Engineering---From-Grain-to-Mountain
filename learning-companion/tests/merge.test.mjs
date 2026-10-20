import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './helpers/load.mjs';

const m = await load('merge');
const { initialState } = await load('planner');

test('guest merge is a union: nothing in the account is replaced', () => {
  const account = initialState();
  const guest = initialState();
  account.settings.theme = 'light';
  guest.settings.theme = 'dark';
  account.topics = { a: true, b: false };
  guest.topics = { b: true, c: true };
  account.lessons.D001 = { tasks: [true, true, true], evidence: 'account evidence here', completedAt: '2026-10-10T10:00:00.000Z', reviews: [] };
  guest.lessons.D001 = { tasks: [true, true, true], evidence: 'guest evidence here', completedAt: '2026-10-05T10:00:00.000Z', reviews: ['2026-10-06T10:00:00.000Z'] };
  guest.lessons.D002 = { tasks: [true, false, false], evidence: '', reviews: [] };
  account.verified = { M00: '2026-10-12T00:00:00.000Z' };
  guest.verified = { M00: '2026-10-11T00:00:00.000Z', M01: '2026-10-13T00:00:00.000Z' };
  account.units = { 'M00.U01': { steps: { learn: '2026-10-15T00:00:00.000Z' }, attempts: [{ at: '2026-10-15T01:00:00.000Z', score: 2, max: 3, answers: [] }], short: {} } };
  guest.units = { 'M00.U01': { steps: { learn: '2026-10-14T00:00:00.000Z', read: '2026-10-14T02:00:00.000Z' }, attempts: [{ at: '2026-10-14T03:00:00.000Z', score: 3, max: 3, answers: [] }], short: {}, evidence: 'guest repo', passedAt: '2026-10-14T04:00:00.000Z' } };
  account.activity = [{ at: '2026-10-15T01:00:00.000Z', kind: 'quiz', id: 'M00.U01' }];
  guest.activity = [{ at: '2026-10-14T03:00:00.000Z', kind: 'quiz', id: 'M00.U01' }, { at: '2026-10-15T01:00:00.000Z', kind: 'quiz', id: 'M00.U01' }];

  const merged = m.mergeStates(account, guest);
  assert.deepEqual(merged.topics, { a: true, b: true, c: true });
  assert.equal(merged.lessons.D001.completedAt, '2026-10-05T10:00:00.000Z', 'earliest completion kept');
  assert.equal(merged.lessons.D001.reviews.length, 1);
  assert.ok(merged.lessons.D002, 'guest-only lesson added');
  assert.equal(merged.verified.M00, '2026-10-11T00:00:00.000Z');
  assert.ok(merged.verified.M01);
  const u = merged.units['M00.U01'];
  assert.equal(u.attempts.length, 2);
  assert.equal(u.steps.learn, '2026-10-14T00:00:00.000Z');
  assert.ok(u.steps.read);
  assert.equal(u.passedAt, '2026-10-14T04:00:00.000Z');
  assert.equal(u.evidence, 'guest repo');
  assert.equal(merged.activity.length, 2, 'duplicate events collapse');
  assert.equal(merged.settings.theme, 'light', 'device settings come from the account side');
});

test('profile: an onboarded account keeps its own; otherwise the guest profile is adopted', () => {
  const p = (track, onboarded) => ({ track, level: 'new', hoursPerWeek: 8, testedOut: track === 'fde' ? ['M00.U01'] : [], startedAt: '2026-10-01T00:00:00.000Z', onboarded });
  const a = initialState();
  const g = initialState();
  g.profile = p('fde', true);
  assert.equal(m.mergeStates(a, g).profile.track, 'fde');
  a.profile = p('mlops', true);
  const merged = m.mergeStates(a, g);
  assert.equal(merged.profile.track, 'mlops');
  assert.deepEqual(merged.profile.testedOut, ['M00.U01']);
});

test('hasProgress and summary describe what would be merged', () => {
  const s = initialState();
  assert.equal(m.hasProgress(s), false);
  s.topics.x = true;
  s.units = { u: { steps: {}, attempts: [], short: {}, passedAt: '2026-10-01T00:00:00.000Z' } };
  assert.equal(m.hasProgress(s), true);
  assert.equal(m.progressSummary(s), '1 unit passed, 1 topic');
});
