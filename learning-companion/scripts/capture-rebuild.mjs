// Screenshots of key screens at 1440 and 390 px from the production web export.
// Usage: node scripts/serve-preview.mjs & CHROME=/usr/bin/chromium node scripts/capture-rebuild.mjs
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8090';
const out = process.env.OUT ?? 'design/shots/rebuild';
const only = process.env.ONLY?.split(',');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });

const day = n => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(19, 0, 0, 0); return d.toISOString(); };
const activity = [];
for (let n = 0; n < 120; n++) if ((n * 7) % 5 < 3) for (let k = 0; k < 1 + (n % 4); k++) activity.push({ at: new Date(Date.parse(day(n)) + k * 60000).toISOString(), kind: 'step', id: 'M00.U01:learn' });
activity.sort((a, b) => a.at.localeCompare(b.at));
const seeded = {
  version: 1,
  lessons: { D001: { tasks: [true, true, true], evidence: 'Created hello.py, ran it with python hello.py and explained input/output.', completedAt: day(30), reviews: [] } },
  topics: { 'M00.01.06': true, 'M00.01.07': true },
  verified: {},
  settings: { theme: 'dark', reminders: false, times: ['09:00', '20:00'], weekdays: [0, 1, 2, 3, 4, 5, 6], quietStart: '22:00', quietEnd: '08:00' },
  profile: { track: 'ai-engineer', level: 'some-python', hoursPerWeek: 8, testedOut: [], startedAt: day(40), onboarded: true },
  units: {
    'M00.U01': { steps: { learn: day(3), read: day(3), practice: day(2), assess: day(2) }, evidence: 'https://github.com/me/learning', attempts: [{ at: day(2), score: 3, max: 3, answers: [1, 2, 2] }], short: {}, passedAt: day(2) },
    'M00.U02': { steps: { learn: day(1) }, attempts: [], short: {} },
  },
  activity,
};

const screens = [
  ['landing', '/', null],
  ['start', '/start', null],
  ['today', '/today', seeded],
  ['map', '/map', seeded],
  ['unit', '/unit/M00.U02', seeded],
  ['module', '/module/M00', seeded],
  ['progress', '/progress', seeded],
  ['library', '/library', seeded],
  ['signin', '/signin', seeded],
  ['settings', '/settings', seeded],
].filter(([n]) => !only || only.includes(n));

const problems = [];
for (const [w, h] of [[1440, 1000], [390, 844]]) {
  for (const [name, route, state] of screens) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', e => problems.push(`${name}@${w}: ${e.message}`));
    await page.addInitScript(s => {
      if (s && !localStorage.getItem('seeded')) {
        localStorage.setItem('ai-learning-v1', JSON.stringify(s));
        localStorage.setItem('seeded', '1');
      }
    }, state);
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) problems.push(`${name}@${w}: horizontal overflow`);
    const title = await page.title();
    await page.screenshot({ path: `${out}/${w}-${name}.png`, fullPage: process.env.FULL === '1' });
    console.log(`${w}-${name}.png  "${title}"`);
    await context.close();
  }
}
await browser.close();
console.log(problems.length ? `PROBLEMS:\n${problems.join('\n')}` : 'No runtime errors or horizontal overflow.');
