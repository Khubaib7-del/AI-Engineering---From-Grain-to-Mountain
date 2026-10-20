// Scrolls the app's inner scroll view and captures each viewport, for reviewing
// long screens (the web export scrolls a ScrollView, so fullPage shots miss it).
// Usage: node scripts/serve-preview.mjs & CHROME=… OUT=/tmp/scroll ROUTES=/today,/unit/M01.U01 node scripts/scroll-check.mjs
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8090';
const out = process.env.OUT ?? '/tmp/scroll';
const routes = (process.env.ROUTES ?? '/today').split(',');
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number);
const seed = process.env.SEED ? JSON.parse(fs.readFileSync(process.env.SEED, 'utf8')) : null;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true, args: ['--no-sandbox'] });
for (const w of widths) {
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: w, height: w > 600 ? 1000 : 844 } });
    const page = await context.newPage();
    if (seed) await page.addInitScript(s => localStorage.setItem('ai-learning-v1', JSON.stringify(s)), seed);
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    if (process.env.CLICK) {
      await page.getByText(process.env.CLICK).first().click();
      await page.waitForTimeout(600);
    }
    const name = route.replace(/[^\w]+/g, '_');
    for (let i = 0; i < Number(process.env.PAGES ?? 6); i++) {
      await page.screenshot({ path: `${out}/${w}${name}_${i}.png` });
      const moved = await page.evaluate(() => {
        const els = [...document.querySelectorAll('div')].filter(
          e => e.scrollHeight > e.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(e).overflowY),
        );
        const el = els.sort((a, b) => b.clientHeight - a.clientHeight)[0];
        if (!el) return false;
        const before = el.scrollTop;
        el.scrollTop += el.clientHeight * 0.9;
        return el.scrollTop > before;
      });
      await page.waitForTimeout(400);
      if (!moved) break;
    }
    await context.close();
  }
}
await browser.close();
