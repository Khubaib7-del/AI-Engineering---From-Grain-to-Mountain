import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './helpers/load.mjs';

const act = await load('activity');
const { initialState } = await load('planner');
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).toISOString();

test('logActivity appends timestamped events in order and caps the log', () => {
  let s = initialState();
  s = act.logActivity(s, { kind: 'quiz', id: 'M00.U01', score: 1, at: at(2026, 10, 20) });
  s = act.logActivity(s, { kind: 'topic', id: 'M00.01.06', at: at(2026, 10, 19) });
  assert.deepEqual(s.activity.map(e => e.kind), ['topic', 'quiz']);
  assert.equal(s.activity[1].score, 1);
  s.activity = Array.from({ length: act.ACTIVITY_CAP }, (_, i) => ({ at: new Date(2020, 0, 1, 0, i).toISOString(), kind: 'step', id: String(i) }));
  s = act.logActivity(s, { kind: 'unit', id: 'x' });
  assert.equal(s.activity.length, act.ACTIVITY_CAP);
  assert.equal(s.activity.at(-1).id, 'x');
});

test('heatmap is 52 Monday-first weeks ending with today; levels ramp with counts', () => {
  const today = new Date(2026, 9, 21, 15); // Wed 21 Oct 2026
  const events = [at(2026, 10, 21, 9), at(2026, 10, 21, 10), at(2026, 10, 19), ...Array(8).fill(at(2026, 10, 1))].map(x => ({ at: x, kind: 'step', id: 'a' }));
  const grid = act.heatmap(events, today);
  assert.equal(grid.length, 52);
  assert.ok(grid.every(col => col.length === 7));
  assert.equal(new Date(`${grid[0][0].date}T12:00:00`).getDay(), 1, 'rows start on Monday');
  const flat = grid.flat();
  const todayCell = flat.find(c => c.today);
  assert.equal(todayCell.date, '2026-10-21');
  assert.equal(todayCell.count, 2);
  assert.equal(todayCell.level, 2);
  assert.equal(flat.find(c => c.date === '2026-10-01').level, 4);
  assert.ok(flat.filter(c => c.future).every(c => c.date > '2026-10-21'));
  assert.deepEqual([0, 1, 3, 6, 7].map(act.heatLevel), [0, 1, 2, 3, 4]);
});

test('streak: current survives until the end of today, longest is tracked', () => {
  const today = new Date(2026, 9, 21, 8);
  const days = [[10, 10], [10, 11], [10, 12], [10, 13], [10, 19], [10, 20]];
  const events = days.map(([m, d]) => ({ at: at(2026, m, d), kind: 'unit', id: 'x' }));
  assert.deepEqual(act.streaks(events, today), { current: 2, longest: 4 }, 'yesterday still counts before you study today');
  assert.deepEqual(act.streaks([...events, { at: at(2026, 10, 21), kind: 'unit', id: 'y' }], today), { current: 3, longest: 4 });
  assert.equal(act.streaks(events, new Date(2026, 9, 23)).current, 0);
  assert.equal(act.activeDaysInMonth(events, today), 6);
});

test('backfill creates dated events from lessons, reviews and confirmed modules once', () => {
  const s = initialState();
  s.lessons.D001 = { tasks: [true, true, true], evidence: 'x'.repeat(20), completedAt: at(2026, 10, 1), reviews: [at(2026, 10, 2)] };
  s.verified.M00 = at(2026, 10, 3);
  const b = act.backfillActivity(s);
  assert.deepEqual(b.activity.map(e => e.kind), ['lesson', 'review', 'unit']);
  assert.equal(act.backfillActivity(b), b, 'no second backfill');
});
