// LOCAL STUB of the assistant engine (docs/assistant-contract.md). It exposes the
// same exports as src/assistant/index.ts with fake data so the chat UI and Mote can
// be built and screenshotted. At merge, src/ui/assistant-api.ts re-exports from
// '../assistant' instead and this file is deleted. Never imported directly by UI.
import { useMemo, useSyncExternalStore } from 'react';
import { usePath } from './lib/use-path';

export type ProviderId =
  'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'groq' | 'mistral' | 'deepseek' | 'ollama';
export type ProviderInfo = {
  id: ProviderId;
  name: string;
  keyHint: string;
  docsUrl: string;
  defaultModel: string;
  models: string[];
  needsKey: boolean;
};
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  at: string;
  status?: 'streaming' | 'done' | 'error';
};
export type NextStep = {
  id: string;
  label: string;
  detail?: string;
  href?: string;
  kind: 'learn' | 'read' | 'practice' | 'assess' | 'review' | 'rest';
};
export type AssistantStatus = 'unconfigured' | 'checking' | 'ready' | 'error';

const PROVIDERS: ProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    keyHint: 'sk-…',
    docsUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o4-mini'],
    needsKey: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    keyHint: 'sk-ant-…',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-5-haiku-latest',
    models: ['claude-3-5-haiku-latest', 'claude-sonnet-4-0'],
    needsKey: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    keyHint: 'AIza…',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-2.5-pro'],
    needsKey: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    keyHint: 'sk-or-…',
    docsUrl: 'https://openrouter.ai/keys',
    defaultModel: 'openrouter/auto',
    models: ['openrouter/auto'],
    needsKey: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    keyHint: 'gsk_…',
    docsUrl: 'https://console.groq.com/keys',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile'],
    needsKey: true,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    keyHint: '32 characters',
    docsUrl: 'https://console.mistral.ai/api-keys',
    defaultModel: 'mistral-small-latest',
    models: ['mistral-small-latest'],
    needsKey: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    keyHint: 'sk-…',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat'],
    needsKey: true,
  },
  {
    id: 'ollama',
    name: 'Ollama (local)',
    keyHint: 'no key needed',
    docsUrl: 'https://ollama.com',
    defaultModel: 'llama3.2',
    models: ['llama3.2'],
    needsKey: false,
  },
];

type Snapshot = {
  status: AssistantStatus;
  error?: string;
  config?: { provider: ProviderId; model: string; keyPreview: string };
  messages: ChatMessage[];
  unitId?: string;
};
let snap: Snapshot = { status: 'unconfigured', messages: [] };
const listeners = new Set<() => void>();
const set = (patch: Partial<Snapshot>) => {
  snap = { ...snap, ...patch };
  listeners.forEach(l => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
let timer: ReturnType<typeof setInterval> | undefined;

function detectProvider(key: string): ProviderId | null {
  const k = key.trim();
  if (k.startsWith('sk-ant-')) return 'anthropic';
  if (k.startsWith('sk-or-')) return 'openrouter';
  if (k.startsWith('gsk_')) return 'groq';
  if (k.startsWith('AIza')) return 'gemini';
  if (k.startsWith('sk-')) return 'openai';
  return null;
}

const FAKE = (q: string, unit?: string) =>
  `Here is a short answer${unit ? ` grounded in **${unit}**` : ''}.\n\n` +
  `You asked: _${q.slice(0, 80)}_\n\n` +
  `1. Start from the idea in plain words.\n2. Try it in code.\n3. Check yourself with one question.\n\n` +
  '```python\nname = input("What is your name? ")\nprint(f"hello, {name}")\n```\n\n' +
  'Run it, then change the greeting. *This is placeholder text from the local stub.*';

function streamReply(text: string) {
  const id = `a${Date.now()}`;
  const full = FAKE(text, snap.unitId);
  set({
    messages: [
      ...snap.messages,
      { id, role: 'assistant', text: '', at: new Date().toISOString(), status: 'streaming' },
    ],
  });
  let i = 0;
  clearInterval(timer);
  timer = setInterval(() => {
    i = Math.min(full.length, i + 6);
    const done = i >= full.length;
    set({
      messages: snap.messages.map(m =>
        m.id === id ? { ...m, text: full.slice(0, i), status: done ? 'done' : 'streaming' } : m,
      ),
    });
    if (done) clearInterval(timer);
  }, 24);
}

export function useAssistant() {
  const s = useSyncExternalStore(
    subscribe,
    () => snap,
    () => snap,
  );
  return {
    status: s.status,
    error: s.error,
    providers: PROVIDERS,
    config: s.config,
    detectProvider,
    async connect(key: string, provider?: ProviderId, model?: string) {
      const id = provider ?? detectProvider(key);
      set({ status: 'checking', error: undefined });
      await new Promise(r => setTimeout(r, 600));
      const info = PROVIDERS.find(p => p.id === id);
      if (!info || (info.needsKey && key.trim().length < 8)) {
        set({ status: 'error', error: 'That key was not accepted. Check it and try again.' });
        return;
      }
      set({
        status: 'ready',
        config: {
          provider: info.id,
          model: model ?? info.defaultModel,
          keyPreview: info.needsKey ? `${key.trim().slice(0, 5)}…${key.trim().slice(-4)}` : 'local',
        },
      });
    },
    async disconnect() {
      set({ status: 'unconfigured', config: undefined, messages: [] });
    },
    setModel(model: string) {
      if (snap.config) set({ config: { ...snap.config, model } });
    },
    messages: s.messages,
    async send(text: string) {
      set({
        messages: [
          ...snap.messages,
          { id: `u${Date.now()}`, role: 'user', text, at: new Date().toISOString(), status: 'done' },
        ],
      });
      streamReply(text);
    },
    stop() {
      clearInterval(timer);
      set({ messages: snap.messages.map(m => (m.status === 'streaming' ? { ...m, status: 'done' } : m)) });
    },
    clear() {
      clearInterval(timer);
      set({ messages: [] });
    },
    context: { unitId: s.unitId, setUnit: (id?: string) => snap.unitId !== id && set({ unitId: id }) },
  };
}

/** Fake but plausible: reads the learner's path so the bubbles point somewhere real. */
export function useNextSteps(): { now: NextStep; then: NextStep[]; tip?: string } {
  const path = usePath();
  return useMemo(() => {
    const cur = path.today ?? path.current;
    if (!cur)
      return {
        now: {
          id: 'rest',
          label: 'Every unit is passed. Rest, then pick a capstone.',
          kind: 'rest',
          href: '/map',
        },
        then: [],
      };
    const step = !cur.progress ? 'learn' : cur.progress < 0.5 ? 'practice' : 'assess';
    const verb = step === 'learn' ? 'Watch' : step === 'practice' ? 'Build' : 'Take the quiz for';
    const idx = path.units.findIndex(u => u.unit.id === cur.unit.id);
    const nxt = path.units.slice(idx + 1, idx + 3);
    return {
      now: {
        id: `${cur.unit.id}:${step}`,
        label: `${verb} ${cur.unit.title}`,
        detail: cur.unit.learn.slice ?? cur.unit.learn.title,
        href: `/unit/${cur.unit.id}`,
        kind: step,
      },
      then: nxt.map(u => ({
        id: `${u.unit.id}:learn`,
        label: u.unit.title,
        href: `/unit/${u.unit.id}`,
        kind: 'learn' as const,
      })),
      tip: 'Short sessions count. 25 focused minutes beats a long distracted evening.',
    };
  }, [path]);
}
