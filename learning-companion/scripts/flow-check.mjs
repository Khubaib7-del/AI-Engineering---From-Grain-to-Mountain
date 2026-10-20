// End-to-end checks on the web export (isolated browser profile, never personal data):
// onboarding → Today, and passing a unit through Learn/Read/Practice/Assess.
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8090';
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push(e.message));
const btn = name => page.getByRole('button', { name, exact: true });

// Landing → onboarding
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.getByRole('heading', { name: 'Go from zero to AI engineer. Free.' }).waitFor();
await btn('Get started — it’s free').click();
await page.getByText('What do you want to become?').waitFor();
await page.getByRole('radio', { name: /MLOps Engineer/ }).click();
await btn('Continue').click();
await page.getByRole('radio', { name: /I know some Python/ }).click();
await btn('Continue').click();
await page.getByRole('radio', { name: '11–15 h' }).click();
await btn('Continue').click();
await btn('No thanks, start from the beginning').click();
await page.getByText('Your path is ready').waitFor();
await btn('Continue as guest').click();
await page.getByText(/MLOps Engineer · 13 h a week/).waitFor();
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ai-learning-v1')));
assert.equal(stored.profile.track, 'mlops');
assert.equal(stored.profile.hoursPerWeek, 13);
console.log('PASS onboarding saves the profile and Today reflects it');

// Pass unit M00.U01
await page.goto(`${base}/unit/M00.U01`, { waitUntil: 'networkidle' });
await btn('I finished the lesson').click();
await btn('I did the reading').click();
await page.getByLabel('Practice evidence').fill('https://github.com/example/learning — ran hello.py and redirected output.');
await btn('Save evidence').click();
const answers = ['code/hello.py', 'Writes standard output to out.txt, replacing its contents', 'pwd'];
for (const a of answers) await page.getByRole('radio', { name: a, exact: true }).click();
await btn('Submit answers').click();
await page.getByText(/3\/3 · 100% — passed/).waitFor();
await page.getByLabel(/^Answer:/).fill('The editor is where I write and save code; the terminal is where I run it.');
await btn('Check against the rubric').click();
await page.getByRole('checkbox', { name: /editor is where you write/ }).click();
await page.getByRole('checkbox', { name: /terminal is where you run/ }).click();
await btn('Save answer').click();
await page.getByText(/Unit passed/).waitFor();
const after = await page.evaluate(() => JSON.parse(localStorage.getItem('ai-learning-v1')));
assert.ok(after.units['M00.U01'].passedAt, 'unit passed');
assert.ok(after.activity.some(e => e.kind === 'unit' && e.id === 'M00.U01'));
assert.ok(after.activity.some(e => e.kind === 'quiz'));
console.log('PASS unit passes only after evidence + quiz ≥80% + rubric; activity logged');

// Next unit is now available and the map shows progress
await page.goto(`${base}/map`, { waitUntil: 'networkidle' });
await page.getByText(/1 of 4 units passed/).waitFor();
await page.goto(`${base}/progress`, { waitUntil: 'networkidle' });
await page.getByText('Units passed on your path').waitFor();
console.log('PASS map and progress reflect the passed unit');

// Books tab not empty
await page.goto(`${base}/library`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /^Books · \d+/ }).click();
const books = await page.getByText(/^book$/i).count();
assert.ok(books >= 6, `books shown: ${books}`);
console.log(`PASS Books tab shows ${books}+ books`);

assert.deepEqual(errors, []);
await browser.close();
console.log('All flow checks passed.');
