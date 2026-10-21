// Assistant panel screenshots with a mocked Mistral API (no real key needed).
// Usage: node scripts/serve-preview.mjs & node scripts/capture-chat.mjs
// Env: MODES=dusk,dawn,terminal  WIDTHS=1440,390  OUT=design/shots/chat
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:8090';
const out = process.env.OUT ?? 'design/shots/chat';
const modes = (process.env.MODES ?? 'dusk,dawn').split(',');
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });

const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
const seeded = theme => ({
  version: 1, lessons: {}, topics: {}, verified: {},
  settings: { theme, reminders: false, times: ['09:00', '20:00'], weekdays: [0, 1, 2, 3, 4, 5, 6], quietStart: '22:00', quietEnd: '08:00' },
  profile: { track: 'ai-engineer', level: 'some-python', hoursPerWeek: 8, testedOut: [], startedAt: day(10), onboarded: true },
  units: { 'M00.U01': { steps: { learn: day(1) }, attempts: [], short: {} } },
  activity: [],
});
const MODELS = ['mistral-small-latest', 'mistral-small-2506', 'mistral-medium-latest', 'mistral-medium-2508', 'mistral-large-latest', 'magistral-medium-latest', 'magistral-small-latest', 'codestral-latest', 'codestral-2508', 'devstral-medium-latest', 'devstral-small-latest', 'ministral-8b-latest', 'ministral-3b-latest', 'pixtral-large-latest', 'open-mistral-nemo', 'mistral-embed', 'mistral-ocr-latest'];
const REPLY = `Good question. This unit sets up the **tools every AI engineer uses daily**.

### **Why it matters**
- You'll run Python from a terminal and manage packages with \`uv\`
- Git lets you **ship and undo** work safely
  - every project in later modules is a repo

---

1. Install Python 3.13
2. Run \`python --version\`

\`\`\`bash
uv init hello && cd hello && uv run main.py
\`\`\`

> Tip: commit after every small win.`;

async function mock(page, slow) {
  await page.route('https://api.mistral.ai/v1/models', r => r.fulfill({ json: { data: MODELS.map(id => ({ id, capabilities: { completion_chat: !/embed|ocr/.test(id) } })) } }));
  await page.route('https://api.mistral.ai/v1/chat/completions', async r => {
    const chunks = REPLY.match(/.{1,12}/gs);
    const body = chunks.map(t => `data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`).join('') + 'data: [DONE]\n\n';
    if (slow) await new Promise(res => setTimeout(res, 60000));
    await r.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' }, body });
  });
}

const problems = [];
for (const mode of modes) for (const w of widths) {
  const shots = async (name, steps, slow = false) => {
    const context = await browser.newContext({ viewport: { width: w, height: w > 600 ? 900 : 844 } });
    const page = await context.newPage();
    page.on('pageerror', e => problems.push(`${mode}/${name}@${w}: ${e.message}`));
    await mock(page, slow);
    await page.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.clear(); localStorage.setItem('ai-learning-v1', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, seeded(mode));
    await page.goto(base + '/unit/M00.U01', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await steps(page);
    const file = `${out}/${mode}-${w}-${name}.png`;
    await page.screenshot({ path: file });
    console.log(file);
    await context.close();
  };
  const open = async page => { await page.keyboard.press('Control+i'); await page.waitForTimeout(700); };
  const connect = async page => {
    await open(page);
    await page.getByRole('radio', { name: 'Mistral' }).click();
    await page.locator('[data-testid="assistant-key"]').fill('test-mistral-key-1234567890');
    await page.locator('[data-testid="assistant-connect"]').click();
    await page.waitForTimeout(1200);
  };
  await shots('setup', async page => { await open(page); await page.getByRole('radio', { name: 'Mistral' }).click(); await page.waitForTimeout(300); });
  await shots('empty', async page => { await connect(page); await page.waitForTimeout(1800); });
  await shots('thinking', async page => { await connect(page); await page.locator('[data-testid="chat-input"]').fill('Why does this unit matter?'); await page.keyboard.press('Enter'); await page.waitForTimeout(900); }, true);
  await shots('reply', async page => { await connect(page); await page.locator('[data-testid="chat-input"]').fill('Why does this unit matter?'); await page.keyboard.press('Enter'); await page.waitForTimeout(2500); });
  await shots('models', async page => { await connect(page); await page.locator('[data-testid="chat-model"]').click(); await page.waitForTimeout(500); });
  await shots('settings', async page => { await connect(page); await page.locator('[data-testid="chat-settings"]').click(); await page.waitForTimeout(500); });
}
await browser.close();
console.log(problems.length ? `PROBLEMS:\n${problems.join('\n')}` : 'No runtime errors.');
