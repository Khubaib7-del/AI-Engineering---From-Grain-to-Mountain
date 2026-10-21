// Map list arrows (rest, hover, pressed/open) and Mote reacting to a tap, dark terminal theme.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8090';
const out = 'design/shots/chat';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
const seeded = theme => ({ version: 1, lessons: {}, topics: {}, verified: {}, settings: { theme, reminders: false, times: ['09:00'], weekdays: [0, 1, 2, 3, 4, 5, 6], quietStart: '22:00', quietEnd: '08:00' }, profile: { track: 'ai-engineer', level: 'some-python', hoursPerWeek: 8, testedOut: [], startedAt: day(10), onboarded: true }, units: {}, activity: [] });
const errors = [];
for (const [theme, w, h] of [['terminal', 1440, 900], ['dusk', 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(s => { localStorage.setItem('ai-learning-v1', JSON.stringify(s)); }, seeded(theme));
  await page.goto(base + '/map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.getByRole('tab', { name: 'List' }).click();
  await page.waitForTimeout(500);
  const btn = page.getByRole('button', { name: /^Expand Python/ }).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.hover();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/arrows-${theme}-hover.png` });
  await btn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/arrows-${theme}-open.png` });
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('mote').click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${out}/mote-${theme}-tap${i}.png`, clip: w < 500 ? { x: 230, y: 640, width: 160, height: 200 } : { x: 1280, y: 760, width: 160, height: 140 } });
    await page.waitForTimeout(1300);
  }
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'ok');
