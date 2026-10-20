import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './helpers/load.mjs';

const b = await load('bubbles');
const steps = {
  now: { id: 'M01.U01:learn', label: 'Watch Functions, variables', href: '/unit/M01.U01', kind: 'learn' },
  then: [
    { id: 'M01.U02:learn', label: 'Conditionals', href: '/unit/M01.U02', kind: 'learn' },
    { id: 'M01.U03:learn', label: 'Loops', href: '/unit/M01.U03', kind: 'learn' },
  ],
};

test('Mote renders "Now" then "Then" bubbles from useNextSteps', () => {
  const out = b.nextStepBubbles(steps);
  assert.equal(out.length, 2);
  assert.deepEqual(out.map(x => `${x.prefix}: ${x.text}`), ['Now: Watch Functions, variables', 'Then: Conditionals']);
  assert.equal(out[0].href, '/unit/M01.U01', 'tapping the Now bubble opens the unit');
  assert.equal(out[1].href, '/unit/M01.U02');
});

test('only a Now bubble when nothing follows', () => {
  const out = b.nextStepBubbles({ now: steps.now, then: [] });
  assert.deepEqual(out.map(x => x.key), ['now']);
});

test('dismissing hides the bubbles until the next step changes', () => {
  assert.deepEqual(b.nextStepBubbles(steps, 'M01.U01:learn'), []);
  const moved = { ...steps, now: { ...steps.now, id: 'M01.U01:practice', label: 'Build hello.py' } };
  assert.equal(b.nextStepBubbles(moved, 'M01.U01:learn').length, 2);
});

test('long labels are clipped so a bubble never overflows', () => {
  const long = { now: { ...steps.now, label: 'x'.repeat(200) }, then: [] };
  const [now] = b.nextStepBubbles(long);
  assert.equal(now.text.length, b.BUBBLE_MAX);
  assert.ok(now.text.endsWith('…'));
});

test('no steps, no bubbles', () => {
  assert.deepEqual(b.nextStepBubbles(undefined), []);
});

test('Mote mood: celebrate, then idle, sleepy after a quiet spell', () => {
  assert.equal(b.moteMood(1000, 900, 5000), 'celebrate');
  assert.equal(b.moteMood(1000, 900), 'idle');
  assert.equal(b.moteMood(b.SLEEP_AFTER_MS + 2000, 1000), 'sleepy');
});

test('Mote looks toward the pointer with a dead zone', () => {
  assert.deepEqual(b.gaze(100, -100), { x: 1, y: -1 });
  assert.deepEqual(b.gaze(5, 5), { x: 0, y: 0 });
});
