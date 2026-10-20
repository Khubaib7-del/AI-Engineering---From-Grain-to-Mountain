import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './helpers/load.mjs';

const t = await load('theme');
const { PALETTES } = await load('palettes');
const p = await load('planner');

test('theme modes: legacy values map onto Dawn/Dusk, unknown falls back to system', () => {
  assert.equal(t.normalizeTheme('light'), 'dawn');
  assert.equal(t.normalizeTheme('dark'), 'dusk');
  for (const m of t.THEME_MODES) assert.equal(t.normalizeTheme(m), m);
  assert.equal(t.normalizeTheme('purple'), 'system');
  assert.equal(t.normalizeTheme(undefined), 'system');
});

test('system mode follows the device scheme', () => {
  assert.equal(t.resolveTheme('system', 'light'), 'dawn');
  assert.equal(t.resolveTheme('system', 'dark'), 'dusk');
  assert.equal(t.resolveTheme('system', null), 'dusk');
  assert.equal(t.resolveTheme('terminal', 'light'), 'terminal');
  assert.equal(t.resolveTheme('light', 'dark'), 'dawn');
});

test('a chosen colour mode persists through the saved notebook (serialize → parse)', () => {
  for (const mode of t.THEME_MODES) {
    const s = p.initialState();
    s.settings.theme = mode;
    const restored = p.parseBackup(JSON.stringify(s), [], [], [], {});
    assert.equal(restored.settings.theme, mode);
  }
});

test('old notebooks saved with light/dark load as Dawn/Dusk', () => {
  for (const [old, now] of [['light', 'dawn'], ['dark', 'dusk']]) {
    const s = p.initialState();
    s.settings.theme = old;
    assert.equal(p.parseBackup(JSON.stringify(s), [], [], [], {}).settings.theme, now);
  }
});

test('an invalid theme is still rejected as a corrupt backup', () => {
  const s = p.initialState();
  s.settings.theme = 'neon';
  assert.throws(() => p.parseBackup(JSON.stringify(s), [], [], [], {}));
});

test('new notebooks default to the system mode', () => {
  assert.equal(p.initialState().settings.theme, 'system');
});

test('every palette keeps text at WCAG AA (contrast mode at AAA)', () => {
  for (const [name, c] of Object.entries(PALETTES)) {
    const min = name === 'contrast' ? 7 : 4.5;
    for (const bg of [c.bg, c.surface, c.raised, ...c.gradient])
      for (const key of ['ink', 'muted', 'faint', 'accentText', 'signal', 'danger'])
        assert.ok(t.contrast(c[key], bg) >= min, `${name}.${key} on ${bg}: ${t.contrast(c[key], bg).toFixed(2)}`);
    assert.ok(t.contrast(c.onAccent, c.accent) >= 4.5, `${name} onAccent`);
    assert.ok(t.contrast(c.accentText, c.accentSoft) >= 4.5, `${name} accentText on accentSoft`);
    assert.ok(t.contrast(c.plateInk, c.plate) >= 7, `${name} plate`);
    assert.ok(t.contrast(c.ink, c.soft) >= 4.5, `${name} ink on soft`);
    assert.ok(t.contrast(c.muted, c.soft) >= 4.5, `${name} muted on soft`);
  }
});

test('procedural art is deterministic and well formed', async () => {
  const d = await load('dither');
  const m = d.bayer(4).flat();
  assert.equal(new Set(m).size, 16);
  assert.ok(m.every(v => v > 0 && v < 1));
  const a = d.asciiMountain(60, 18, -0.5);
  assert.equal(a.length, 18);
  assert.ok(a.every(l => l.length === 60));
  assert.deepEqual(a, d.asciiMountain(60, 18, -0.5));
  assert.notDeepEqual(a, d.asciiMountain(60, 18, 0.7), 'light direction changes the shading');
  const path = d.ditherPath(40, 20, 4, d.mountainField());
  assert.match(path, /^M\d/);
  assert.equal(d.asciiRule(32).length, 32);
});
