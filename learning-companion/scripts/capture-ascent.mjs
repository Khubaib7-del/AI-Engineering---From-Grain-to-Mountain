// Ascent screenshots: every screen at 1440 and 390 in Dawn and Dusk (+ landing in Terminal).
// Usage: node scripts/serve-preview.mjs & CHROME=/path/to/chrome node scripts/capture-ascent.mjs
// Env: MODES=dawn,dusk  ONLY=today,map  WIDTHS=1440,390  OUT=design/shots/ascent
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8090';
const out = process.env.OUT ?? 'design/shots/ascent';
const only = process.env.ONLY?.split(',');
const modes = (process.env.MODES ?? 'dawn,dusk').split(',');
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });

const day = n => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(19, 0, 0, 0); return d.toISOString(); };
const activity = [];
for (let n = 0; n < 120; n++) if ((n * 7) % 5 < 3) for (let k = 0; k < 1 + (n % 4); k++) activity.push({ at: new Date(Date.parse(day(n)) + k * 60000).toISOString(), kind: 'step', id: 'M00.U01:learn' });
activity.sort((a, b) => a.at.localeCompare(b.at));
const settings = theme => ({ theme, reminders: false, times: ['09:00', '20:00'], weekdays: [0, 1, 2, 3, 4, 5, 6], quietStart: '22:00', quietEnd: '08:00' });
const guest = theme => ({ version: 1, lessons: {}, topics: {}, verified: {}, settings: settings(theme) });
const seeded = theme => ({
  version: 1,
  lessons: {},
  topics: { 'M00.01.06': true },
  verified: {},
  settings: settings(theme),
  profile: { track: 'ai-engineer', level: 'some-python', hoursPerWeek: 8, testedOut: [], startedAt: day(40), onboarded: true },
  units: {
    'M00.U01': { steps: { learn: day(3), read: day(3), practice: day(2), assess: day(2) }, evidence: 'https://github.com/me/learning', attempts: [{ at: day(2), score: 3, max: 3, answers: [1, 2, 2] }], short: {}, passedAt: day(2) },
    'M00.U02': { steps: { learn: day(1) }, attempts: [], short: {} },
  },
  activity,
});

const click = sel => async page => {
  // On phones Mote shows a one-line peek first; tap Mote to open the full tips.
  if (sel.includes('mote-tell-more') && !(await page.locator(sel).count())) { await page.locator('[data-testid="mote"]').click(); await page.waitForTimeout(500); }
  await page.locator(sel).first().click();
  await page.waitForTimeout(800);
};
const screens = [
  ['landing', '/', guest],
  ['onboarding', '/start', guest],
  ['today', '/today', seeded],
  ['map', '/map', seeded],
  ['map-list', '/map', seeded, async page => { await page.getByRole('tab', { name: 'List' }).click(); await page.waitForTimeout(600); }],
  ['module', '/module/M00', seeded],
  ['unit', '/unit/M00.U02', seeded],
  ['progress', '/progress', seeded],
  ['library', '/library', seeded],
  ['signin', '/signin', guest],
  ['signup', '/signup', guest],
  ['settings', '/settings', seeded],
  ['chat-setup', '/unit/M00.U02', seeded, click('[data-testid="mote-tell-more"]')],
  ['chat', '/unit/M00.U02', seeded, async page => {
    await click('[data-testid="mote-tell-more"]')(page);
    await page.locator('[data-testid="assistant-key"]').fill('sk-test-1234567890abcdef');
    await page.waitForTimeout(300);
    await click('[data-testid="assistant-connect"]')(page);
    await page.waitForTimeout(900);
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Explain/ }).first().click();
    await page.waitForTimeout(3500);
  }],
].filter(([n]) => !only || only.includes(n));

const problems = [];
const jobs = [];
for (const mode of modes) for (const w of widths) for (const s of screens) jobs.push([mode, w, ...s]);
if (!only || only.includes('landing-terminal')) for (const w of widths) if (process.env.TERMINAL !== '0') jobs.push(['terminal', w, 'landing', '/', guest]);
for (const [mode, w, name, route, make, step] of jobs) {
  const context = await browser.newContext({ viewport: { width: w, height: w > 600 ? 1000 : 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', e => problems.push(`${mode}/${name}@${w}: ${e.message}`));
  await page.addInitScript(s => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('ai-learning-v1', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, make(mode));
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  if (step) await step(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (overflow) problems.push(`${mode}/${name}@${w}: horizontal overflow`);
  const file = `${out}/${mode}-${w}-${name}.png`;
  await page.screenshot({ path: file, fullPage: process.env.FULL === '1' });
  console.log(file);
  await context.close();
}
await browser.close();
console.log(problems.length ? `PROBLEMS:\n${problems.join('\n')}` : 'No runtime errors or horizontal overflow.');
