import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadSrc } from './helpers/load-src.mjs';
import { load } from './helpers/load.mjs';
import { modules, units as fxUnits } from './helpers/fixture.mjs';

const prov = await loadSrc('assistant/providers');
const sse = await loadSrc('assistant/sse');
const errors = await loadSrc('assistant/errors');
const history = await loadSrc('assistant/history');
const grounding = await loadSrc('assistant/grounding');
const ns = await loadSrc('assistant/next-steps');
const { createEngine } = await loadSrc('assistant/engine');
const { initialState } = await load('planner');
const { pathUnits } = await load('path');
const fixture = name => fs.readFileSync(`tests/fixtures/sse/${name}.txt`, 'utf8');

// ---------------------------------------------------------------------------
// Provider detection and model choice
// ---------------------------------------------------------------------------
test('detectProvider maps key prefixes; specific prefixes win over generic sk-', () => {
  const cases = {
    'sk-ant-api03-abc': 'anthropic',
    'sk-or-v1-abc': 'openrouter',
    gsk_abcdef: 'groq',
    AIzaSyA1234567890: 'gemini',
    'sk-proj-abc': 'openai',
    'sk-abc123': 'openai',
    'http://localhost:11434': 'ollama',
    '192.168.1.20:11434': 'ollama',
    '  sk-ant-padded  ': 'anthropic',
  };
  for (const [key, id] of Object.entries(cases)) assert.equal(prov.detectProvider(key), id, key);
  assert.equal(prov.detectProvider(''), null);
  assert.equal(prov.detectProvider('abc123mistralkey'), null, 'Mistral/DeepSeek need the picker');
});

test('provider list covers all eight providers with defaults; only Ollama needs no key', () => {
  const list = prov.providerList();
  assert.deepEqual(list.map(p => p.id), ['openai', 'anthropic', 'gemini', 'openrouter', 'groq', 'mistral', 'deepseek', 'ollama']);
  assert.deepEqual(list.filter(p => !p.needsKey).map(p => p.id), ['ollama']);
  for (const p of list.filter(p => p.needsKey)) assert.ok(p.defaultModel && p.docsUrl.startsWith('https://'), p.id);
  assert.ok(!('prefer' in list[0]), 'internal matching rules stay private');
});

test('chooseModel prefers cheap fast chat models from the live list and skips non-chat models', () => {
  assert.equal(prov.chooseModel('openai', ['gpt-6-astra', 'gpt-6-luna', 'gpt-realtime-2', 'text-embedding-3']), 'gpt-6-luna');
  assert.equal(prov.chooseModel('openai', ['gpt-7-luna', 'gpt-7-astra']), 'gpt-7-luna', 'newer generation still matches');
  assert.equal(prov.chooseModel('anthropic', ['claude-opus-5-5', 'claude-haiku-5-5', 'claude-sonnet-5-5']), 'claude-haiku-5-5');
  assert.equal(prov.chooseModel('gemini', ['gemini-3.8-flash-tts', 'gemini-4-argon', 'gemini-3.8-flash']), 'gemini-3.8-flash');
  assert.equal(prov.chooseModel('groq', ['whisper-large-v3', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b']), 'openai/gpt-oss-20b');
  assert.equal(prov.chooseModel('ollama', ['nomic-embed-text', 'qwen3:8b']), 'qwen3:8b');
  assert.equal(prov.chooseModel('deepseek', []), 'deepseek-flash', 'empty list falls back to the static default');
  assert.equal(prov.pickerModels('gemini', ['gemini-embedding-001', 'gemini-3.8-flash', 'gemini-2.5-pro'])[0], 'gemini-3.8-flash');
});

test('requests: Anthropic sends the browser-access header; Gemini uses SSE streaming; OpenAI-compatible bases', () => {
  const turns = [{ role: 'user', text: 'hi' }];
  const a = prov.chatRequest('anthropic', 'sk-ant-x', 'claude-haiku-5-5', 'SYS', turns);
  assert.equal(a.init.headers['anthropic-dangerous-direct-browser-access'], 'true');
  assert.equal(JSON.parse(a.init.body).system, 'SYS');
  const g = prov.chatRequest('gemini', 'AIzaX', 'gemini-3.8-flash', 'SYS', [...turns, { role: 'assistant', text: 'yo' }]);
  assert.match(g.url, /models\/gemini-3\.8-flash:streamGenerateContent\?alt=sse$/);
  assert.equal(g.init.headers['x-goog-api-key'], 'AIzaX');
  assert.ok(!g.url.includes('AIzaX'), 'key goes in a header, not the URL');
  assert.deepEqual(JSON.parse(g.init.body).contents.map(c => c.role), ['user', 'model']);
  const bases = { openai: 'https://api.openai.com/v1', openrouter: 'https://openrouter.ai/api/v1', groq: 'https://api.groq.com/openai/v1', mistral: 'https://api.mistral.ai/v1', deepseek: 'https://api.deepseek.com' };
  for (const [id, base] of Object.entries(bases)) {
    const r = prov.chatRequest(id, 'k', 'm', 'SYS', turns);
    assert.equal(r.url, `${base}/chat/completions`);
    const body = JSON.parse(r.init.body);
    assert.equal(body.stream, true);
    assert.equal(body.messages[0].role, 'system');
  }
  const o = prov.chatRequest('ollama', 'localhost:11434/', 'llama3.2', 'SYS', turns);
  assert.equal(o.url, 'http://localhost:11434/v1/chat/completions');
  assert.equal(o.init.headers.Authorization, undefined);
  assert.equal(prov.modelsRequest('openrouter', 'sk-or-x').url, 'https://openrouter.ai/api/v1/key', 'OpenRouter validates via /key');
});

test('keyPreview shows only the last four characters', () => {
  assert.equal(prov.keyPreview('openai', 'sk-proj-SUPERSECRET1234'), '••••1234');
  assert.equal(prov.keyPreview('ollama', 'http://192.168.1.4:11434'), '192.168.1.4:11434');
  assert.equal(prov.keyPreview('groq', 'abc'), '••••');
});

// ---------------------------------------------------------------------------
// SSE parsing
// ---------------------------------------------------------------------------
test('SSE parser handles chunk boundaries anywhere, CRLF, comments and multi-line data', () => {
  const body = fixture('openai').replace(/\n/g, '\r\n');
  const events = [];
  const p = sse.createSseParser(e => events.push(e));
  for (let i = 0; i < body.length; i += 7) p.push(body.slice(i, i + 7));
  p.end();
  assert.equal(events.length, 6, 'comment line ignored');
  assert.equal(events.at(-1).data, '[DONE]');
  const multi = [];
  const q = sse.createSseParser(e => multi.push(e));
  q.push('event: x\ndata: a\ndata: b\n\n');
  q.end();
  assert.deepEqual(multi, [{ event: 'x', data: 'a\nb' }]);
});

test('OpenAI-compatible, Anthropic and Gemini streams yield only visible text (no reasoning/thinking)', () => {
  const o = sse.parseSseText('openai', fixture('openai'));
  assert.deepEqual(o, { text: 'What does `print` return?', error: undefined, done: true });
  const a = sse.parseSseText('anthropic', fixture('anthropic'));
  assert.deepEqual(a, { text: 'Try the f-string section at ~30:19.', error: undefined, done: true });
  const g = sse.parseSseText('gemini', fixture('gemini'));
  assert.equal(g.text, 'Hint: what type does input() return?');
  assert.equal(g.error, undefined);
});

test('mid-stream errors are surfaced for each format', () => {
  assert.deepEqual(sse.parseSseText('anthropic', fixture('anthropic-error')), { text: 'Par', error: 'Overloaded', done: false });
  assert.equal(sse.parseSseText('openai', fixture('openai-error')).error, 'Rate limit exceeded');
  assert.match(sse.parseSseText('gemini', 'data: {"error":{"message":"API key not valid"}}\n\n').error, /API key/);
  assert.match(sse.parseSseText('gemini', 'data: {"promptFeedback":{"blockReason":"SAFETY"}}\n\n').error, /SAFETY/);
});

// ---------------------------------------------------------------------------
// Errors and secret safety
// ---------------------------------------------------------------------------
test('HTTP failures become friendly messages and never echo the key', () => {
  const key = 'sk-proj-ABCDEFGHIJKLMNOPQRSTUV1234';
  const bad = errors.httpError('openai', 401, JSON.stringify({ error: { message: `Incorrect API key provided: ${key}` } }), key);
  assert.equal(bad.kind, 'bad-key');
  assert.ok(!bad.message.includes(key));
  assert.equal(errors.httpError('openrouter', 402, '{"error":{"message":"Insufficient credits"}}').kind, 'quota');
  assert.equal(errors.httpError('groq', 429, '').kind, 'rate');
  assert.equal(errors.httpError('gemini', 400, '{"error":{"message":"API key not valid. Please pass a valid API key."}}').kind, 'bad-key');
  assert.equal(errors.httpError('anthropic', 529, '').kind, 'server');
  assert.equal(errors.networkError('openai', new TypeError('Failed to fetch'), true).kind, 'cors');
  assert.equal(errors.networkError('openai', Object.assign(new Error('x'), { name: 'AbortError' }), true).kind, 'aborted');
  assert.match(errors.networkError('ollama', new TypeError('x'), true).message, /OLLAMA_ORIGINS/);
  const text = `my keys: sk-ant-api03-${'x'.repeat(20)} AIza${'y'.repeat(30)} gsk_${'z'.repeat(20)} sk-or-v1-${'w'.repeat(20)}`;
  assert.doesNotMatch(errors.redactSecrets(text), /sk-ant-api03-x|AIzay|gsk_z|sk-or-v1-w/);
  assert.equal(errors.redactSecrets('plain text'), 'plain text');
});

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------
test('history is capped, per unit, and turns start with the user and alternate', () => {
  const msgs = Array.from({ length: 150 }, (_, i) => ({ id: String(i), role: i % 2 ? 'assistant' : 'user', text: `m${i}`, at: '', status: 'done' }));
  assert.equal(history.capHistory(msgs).length, history.HISTORY_MAX_MESSAGES);
  assert.equal(history.capHistory(msgs).at(-1).id, '149', 'newest kept');
  const big = Array.from({ length: 6 }, (_, i) => ({ id: `b${i}`, role: 'user', text: 'x'.repeat(9000), at: '' }));
  const capped = history.capHistory(big);
  assert.deepEqual(capped.map(m => m.id), ['b1', 'b2', 'b3', 'b4', 'b5'], 'character cap drops the oldest');
  assert.ok(capped.every(m => m.text.length === history.MESSAGE_MAX_CHARS), 'long messages are truncated');
  assert.equal(history.threadKey('M01.U01'), 'assistant-chat:M01.U01');
  assert.equal(history.threadKey(), 'assistant-chat:general');
  const turns = history.toTurns([
    { id: '1', role: 'assistant', text: 'welcome', at: '' },
    { id: '2', role: 'user', text: 'a', at: '' },
    { id: '3', role: 'user', text: 'b', at: '' },
    { id: '4', role: 'assistant', text: 'oops', at: '', status: 'error' },
  ]);
  assert.deepEqual(turns, [{ role: 'user', text: 'a\n\nb' }]);
  assert.deepEqual(history.parseHistory('not json'), []);
});

// ---------------------------------------------------------------------------
// Grounding
// ---------------------------------------------------------------------------
test('system prompt grounds in the unit, cites resources, and never contains quiz answers', () => {
  const u = fxUnits[0];
  const prompt = grounding.buildSystemPrompt({
    unit: u,
    module: modules[0],
    trackLabel: 'AI Engineer',
    week: { week: 1, title: 'Start', units: [u.id], hours: 2, detail: ['Day 1: M00.U01 — watch.'] },
    passed: 0,
    total: 6,
    steps: { learn: true, read: false, practice: false, assess: false },
  });
  for (const must of [u.title, u.learn.title, u.learn.url, u.read.url, u.practice.done_when, u.outcomes[0], 'Socratic', 'never give the answer', 'AI Engineer', 'Day 1: M00.U01'])
    assert.ok(prompt.includes(must), must);
  for (const q of u.quiz) {
    assert.ok(prompt.includes(q.prompt), 'questions are listed so the tutor recognises them');
    if (q.kind === 'mcq') assert.ok(!prompt.includes(q.explain), 'explanations withheld');
    else for (const r of q.rubric) assert.ok(!prompt.includes(r), 'rubric withheld');
  }
  assert.match(grounding.buildSystemPrompt({}), /None selected/);
});

// ---------------------------------------------------------------------------
// Next steps (deterministic, no key)
// ---------------------------------------------------------------------------
const realUnit = {
  ...fxUnits[0],
  id: 'M00.U01',
  learn: { title: 'CS50P - Lecture 0', url: 'https://youtu.be/x', type: 'video', free: true, verified: '2026-10-20' },
};
const planWeeks = [
  {
    week: 1,
    title: 'Start',
    units: ['M00.U01', 'M00.U02'],
    hours: 6,
    detail: [
      'Day 1: M00.U01 — CS50P Lecture 0 from 0:00 to ~30:19; `indoor` → check50 green.',
      'Day 2: M00.U01 — Lecture 0 ~30:19–1:00:00; `playback`, `faces` → check50 green.',
      'Day 3: M00.U02 — read the shell lesson.',
      'Day 7 (review): quiz M00.U01.',
    ],
  },
  { week: 2, title: 'Next', units: ['M01.U01'], hours: 4 },
];
const mods = [{ ...modules[0], submodules: [{ id: 'S', title: 'S', units: [realUnit, fxUnits[1]] }] }, modules[1]];
const pu = pathUnits(mods);
const known = new Set(pu.map(u => u.unit.id));
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).toISOString();

test('next steps: fresh learner gets the first planned video slice, then the problem and the quiz', () => {
  const now = new Date(2026, 9, 21, 10);
  const r = ns.computeNextSteps({ units: pu, weeks: planWeeks, state: initialState(), known, now });
  assert.equal(r.now.kind, 'learn');
  assert.equal(r.now.label, 'Watch CS50P - Lecture 0 0:00–~30:19');
  assert.equal(r.now.href, 'https://youtu.be/x');
  assert.deepEqual(r.then.map(s => s.kind), ['read', 'practice', 'assess', 'learn']);
  assert.equal(r.then[1].label, 'Do the indoor problem');
  assert.equal(r.then[2].label, 'Take the quiz');
  assert.equal(r.then[3].label, `Then: ${fxUnits[1].title}`);
  assert.match(r.tip, /Start small/);
});

test('next steps advance with study days and steps done; failed quiz suggests a retake', () => {
  const s = initialState();
  s.activity = [{ at: at(2026, 10, 20), kind: 'step', id: 'M00.U01:learn' }];
  const now = new Date(2026, 9, 21, 10);
  let r = ns.computeNextSteps({ units: pu, weeks: planWeeks, state: s, known, now });
  assert.equal(r.now.label, 'Watch CS50P - Lecture 0 ~30:19–1:00:00', 'second planned day after one study day');
  assert.equal(r.then.find(x => x.kind === 'practice').label, 'Do the playback and faces problems');
  s.units = { 'M00.U01': { steps: { learn: 'x', read: 'x' }, evidence: 'https://github.com/me/x', attempts: [{ at: '', score: 1, max: 3, answers: [] }], short: {} } };
  r = ns.computeNextSteps({ units: pu, weeks: planWeeks, state: s, known, now });
  assert.equal(r.now.kind, 'assess');
  assert.equal(r.now.label, 'Retake the quiz');
  assert.match(r.now.detail, /1\/3/);
});

test('next steps: passed units move on; recall is due on spaced days; streak at risk tip', () => {
  const s = initialState();
  s.units = { 'M00.U01': { steps: {}, attempts: [], short: {}, passedAt: 'Mon 2026-10-20 5:00 PM PKT (UTC+05:00)' } };
  s.activity = [
    { at: at(2026, 10, 18), kind: 'unit', id: 'M00.U01' },
    { at: at(2026, 10, 19), kind: 'step', id: 'x' },
    { at: at(2026, 10, 20), kind: 'step', id: 'y' },
  ];
  const now = new Date(2026, 9, 21, 19);
  const r = ns.computeNextSteps({ units: pu, weeks: planWeeks, state: s, known, now });
  assert.ok(r.now.id.startsWith('M00.U02'), 'next unit in the week');
  assert.deepEqual(ns.dueRecall(s, now), ['M00.U01'], 'passed 3 days ago → due');
  assert.equal(r.then[0].kind, 'review');
  assert.match(r.tip, /3-day streak ends at midnight/);
  assert.deepEqual(ns.dueRecall(s, new Date(2026, 9, 23)), [], 'day 5 is not a recall day');
});

test('next steps: everything passed → rest; heavy day → rest tip', () => {
  const s = initialState();
  s.units = Object.fromEntries([...known].map(id => [id, { steps: {}, attempts: [], short: {}, passedAt: 'x' }]));
  const now = new Date(2026, 9, 21, 12);
  s.activity = Array.from({ length: 16 }, (_, i) => ({ at: new Date(2026, 9, 21, 8, i).toISOString(), kind: 'step', id: String(i) }));
  const r = ns.computeNextSteps({ units: pu, weeks: planWeeks, state: s, known, now });
  assert.equal(r.now.kind, 'rest');
  assert.match(r.tip, /break/);
  assert.equal(ns.timeRange('Lecture 0 1:28:33–end (def, return)'), '1:28:33–end');
  assert.deepEqual(ns.problemNames('`uv tool install check50` and `tip`; edit `paths.md`'), ['tip']);
});

test('next steps work on the real curriculum and weekly plan', () => {
  const real = fs.readdirSync('src/content/v2/modules').filter(f => /^M\d+\.json$/.test(f)).sort().map(f => JSON.parse(fs.readFileSync(`src/content/v2/modules/${f}`, 'utf8')));
  const weeks = JSON.parse(fs.readFileSync('src/content/v2/weeks.json', 'utf8'));
  const units = pathUnits(real.filter(m => m.tracks.length));
  const r = ns.computeNextSteps({ units, weeks, state: initialState(), known: new Set(units.map(u => u.unit.id)), now: new Date(2026, 9, 21) });
  assert.ok(r.now.label.length > 5 && r.then.length > 0);
  assert.ok(weeks[0].units.some(id => r.now.id.startsWith(id)), 'starts in week 1');
});

// ---------------------------------------------------------------------------
// Engine: connect, stream, stop, persist — the key never leaks
// ---------------------------------------------------------------------------
function fakeDeps(responder) {
  const secure = new Map();
  const local = new Map();
  const logs = [];
  const enc = new TextEncoder();
  const fetch = async (url, init) => {
    logs.push({ url, init });
    const r = await responder(url, init);
    const chunks = r.chunks ?? [];
    let i = 0;
    return {
      ok: r.status < 400,
      status: r.status,
      text: async () => r.body ?? chunks.join(''),
      json: async () => JSON.parse(r.body),
      body: chunks.length
        ? {
            getReader: () => ({
              read: async () => {
                if (init.signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
                if (r.pauseAt === i) await new Promise((res, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' }))));
                return i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true };
              },
            }),
          }
        : null,
    };
  };
  return {
    secure,
    local,
    logs,
    deps: {
      env: { fetch, isWeb: true },
      readSecret: async () => secure.get('k') ?? null,
      writeSecret: async v => void secure.set('k', v),
      deleteSecret: async () => void secure.delete('k'),
      localGet: async k => local.get(k) ?? null,
      localSet: async (k, v) => void local.set(k, v),
      localRemove: async k => void local.delete(k),
      localKeys: async () => [...local.keys()],
    },
  };
}

const KEY = 'sk-ant-api03-TOPSECRETKEYVALUE9876';

test('engine: connect validates, picks a model, stores the key only in the secure store', async () => {
  const f = fakeDeps(url =>
    url.includes('/v1/models')
      ? { status: 200, body: JSON.stringify({ data: [{ id: 'claude-sonnet-5-5' }, { id: 'claude-haiku-5-5' }] }) }
      : { status: 200, chunks: fixture('anthropic').match(/[\s\S]{1,40}/g) },
  );
  const e = createEngine(f.deps);
  await e.ready();
  assert.equal(e.getSnapshot().status, 'unconfigured');
  await e.connect(KEY);
  const snap = e.getSnapshot();
  assert.equal(snap.status, 'ready');
  assert.deepEqual(snap.config, { provider: 'anthropic', model: 'claude-haiku-5-5', keyPreview: '••••9876' });
  assert.equal(f.secure.get('k'), KEY);
  assert.ok(!JSON.stringify(snap).includes(KEY), 'snapshot (what the UI sees) has no key');
  assert.ok(![...f.local.values()].some(v => v.includes(KEY)), 'non-secret storage has no key');
  // A second engine (app restart) restores from storage.
  const again = createEngine(f.deps);
  await again.ready();
  assert.equal(again.getSnapshot().status, 'ready');
});

test('engine: streams a reply, persists the per-unit thread without the key, even if the user pastes it', async () => {
  const f = fakeDeps(url =>
    url.includes('/v1/models')
      ? { status: 200, body: JSON.stringify({ data: [{ id: 'claude-haiku-5-5' }] }) }
      : { status: 200, chunks: fixture('anthropic').match(/[\s\S]{1,25}/g) },
  );
  const e = createEngine(f.deps);
  await e.connect(KEY);
  await e.setUnit('M01.U01');
  const seen = [];
  e.subscribe(() => seen.push(e.getSnapshot().messages.at(-1)?.text));
  await e.send(`my key is ${KEY} — what does print return?`, 'SYSTEM PROMPT');
  const msgs = e.getSnapshot().messages;
  assert.equal(msgs.length, 2);
  assert.equal(msgs[1].text, 'Try the f-string section at ~30:19.');
  assert.equal(msgs[1].status, 'done');
  assert.ok(seen.filter(Boolean).length > 1, 'streamed incrementally');
  assert.ok(!msgs[0].text.includes(KEY), 'pasted key scrubbed from the message');
  const sent = JSON.parse(f.logs.at(-1).init.body);
  assert.equal(sent.system, 'SYSTEM PROMPT');
  assert.ok(!sent.messages[0].content.includes(KEY), 'pasted key not sent as chat text');
  const stored = f.local.get('assistant-chat:M01.U01');
  assert.ok(stored && !stored.includes(KEY), 'persisted chat has no key');
  assert.ok(!f.local.has('assistant-chat:general'));
  // Threads are per unit.
  await e.setUnit('M00.U01');
  assert.equal(e.getSnapshot().messages.length, 0);
  await e.setUnit('M01.U01');
  assert.equal(e.getSnapshot().messages.length, 2);
});

test('engine: bad key → friendly error, nothing saved; stop() aborts; disconnect wipes everything', async () => {
  const bad = fakeDeps(() => ({ status: 401, body: JSON.stringify({ error: { message: `invalid x-api-key ${KEY}` } }) }));
  const e1 = createEngine(bad.deps);
  await e1.connect(KEY);
  assert.equal(e1.getSnapshot().status, 'error');
  assert.match(e1.getSnapshot().error, /rejected this key/);
  assert.ok(!e1.getSnapshot().error.includes(KEY));
  assert.equal(bad.secure.size, 0);
  await e1.connect('mystery-key-without-prefix');
  assert.match(e1.getSnapshot().error, /Pick it from the list/);

  const f = fakeDeps(url =>
    url.includes('/models')
      ? { status: 200, body: JSON.stringify({ data: [{ id: 'openai/gpt-oss-20b' }] }) }
      : { status: 200, chunks: ['data: {"choices":[{"delta":{"content":"Half"}}]}\n\n', 'data: {"choices":[{"delta":{"content":" more"}}]}\n\n'], pauseAt: 1 },
  );
  const e = createEngine(f.deps);
  await e.connect('gsk_abcdefghijklmnopqrstuvwx');
  assert.equal(e.getSnapshot().config.model, 'openai/gpt-oss-20b');
  const pending = e.send('hello', 'SYS');
  await new Promise(r => setTimeout(r, 20));
  assert.equal(e.getSnapshot().streaming, true);
  e.stop();
  await pending;
  const last = e.getSnapshot().messages.at(-1);
  assert.equal(last.text, 'Half');
  assert.equal(last.status, 'done');
  assert.equal(e.getSnapshot().streaming, false);
  e.setModel('openai/gpt-oss-120b');
  assert.equal(e.getSnapshot().config.model, 'openai/gpt-oss-120b');
  await e.disconnect();
  assert.equal(e.getSnapshot().status, 'unconfigured');
  assert.equal(f.secure.size, 0);
  assert.equal([...f.local.keys()].filter(k => k.startsWith('assistant-')).length, 0);
});

test('engine: Ollama connects with no key using the local URL', async () => {
  const f = fakeDeps(url => {
    assert.ok(url.startsWith('http://localhost:11434/v1/'));
    return { status: 200, body: JSON.stringify({ data: [{ id: 'nomic-embed-text' }, { id: 'llama3.2:3b' }] }) };
  });
  const e = createEngine(f.deps);
  await e.connect('', 'ollama');
  assert.equal(e.getSnapshot().status, 'ready');
  assert.equal(e.getSnapshot().config.model, 'llama3.2:3b');
  assert.equal(e.getSnapshot().config.keyPreview, 'localhost:11434');
});

test('assistant source never logs (no console.* in src/assistant)', () => {
  for (const f of fs.readdirSync('src/assistant')) {
    const src = fs.readFileSync(`src/assistant/${f}`, 'utf8');
    assert.doesNotMatch(src, /console\.(log|info|warn|error|debug)/, f);
  }
});
