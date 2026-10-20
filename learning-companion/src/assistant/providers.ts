// Provider catalogue, key-prefix detection, model choice and request building.
// Pure: no React, no storage, no network. Model IDs were checked against each
// provider's own docs / models list on 2026-10-21 (see docs/assistant-engine.md);
// connect() always prefers what the live models list returns.
import type { ProviderId, ProviderInfo, Turn } from './types';

export const OLLAMA_DEFAULT_URL = 'http://localhost:11434';

type Spec = ProviderInfo & {
  /** Ordered preferences: exact IDs first, then patterns. First match in the live list wins. */
  prefer: (string | RegExp)[];
  /** Families that are never chat models (embeddings, audio, images, moderation…). */
  exclude?: RegExp;
};

const NOT_CHAT =
  /embed|whisper|tts|transcrib|audio|realtime|live|image|banana|veo|omni|moderation|guard|safeguard|ocr|rerank|dall-e|sora|lyria|robotics|search|deep-research|computer-use|:batch|orpheus|voxtral|timestral|shieldstral|codestral/i;

export const PROVIDER_SPECS: Record<ProviderId, Spec> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    keyHint: 'sk-proj-… or sk-…',
    docsUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-6-luna',
    models: ['gpt-6-luna', 'gpt-6.1-sol', 'gpt-6-astra'],
    needsKey: true,
    prefer: ['gpt-6-luna', /^gpt-\d+(\.\d+)?-luna$/, /^gpt-luna-latest$/, /mini$/],
    exclude: NOT_CHAT,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    keyHint: 'sk-ant-…',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-haiku-5-5',
    models: ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5'],
    needsKey: true,
    prefer: ['claude-haiku-5-5', /^claude-haiku-\d+-\d+$/, /^claude-haiku/, /^claude-sonnet/],
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    keyHint: 'AIza…',
    docsUrl: 'https://aistudio.google.com/apikey',
    defaultModel: 'gemini-3.8-flash',
    models: ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'],
    needsKey: true,
    prefer: ['gemini-3.8-flash', /^gemini-\d+(\.\d+)?-flash$/, 'gemini-flash-latest', /^gemini-\d+(\.\d+)?-flash-lite$/],
    exclude: NOT_CHAT,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    keyHint: 'sk-or-…',
    docsUrl: 'https://openrouter.ai/settings/keys',
    defaultModel: 'google/gemini-3.8-flash',
    models: ['google/gemini-3.8-flash', 'openai/gpt-6-luna', 'anthropic/claude-haiku-5.5', 'openai/gpt-oss-120b'],
    needsKey: true,
    prefer: [
      'google/gemini-3.8-flash',
      'openai/gpt-6-luna',
      'anthropic/claude-haiku-5.5',
      /^google\/gemini-\d+(\.\d+)?-flash$/,
      /^openai\/gpt-oss-120b$/,
    ],
    exclude: NOT_CHAT,
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    keyHint: 'gsk_…',
    docsUrl: 'https://console.groq.com/keys',
    defaultModel: 'openai/gpt-oss-20b',
    models: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant'],
    needsKey: true,
    prefer: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', /^qwen\//, /llama/],
    exclude: NOT_CHAT,
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    keyHint: 'Paste your Mistral key (no fixed prefix)',
    docsUrl: 'https://console.mistral.ai/api-keys',
    defaultModel: 'mistral-small-latest',
    models: ['mistral-small-latest', 'mistral-medium-latest', 'ministral-8b-latest'],
    needsKey: true,
    prefer: ['mistral-small-latest', /^mistral-small/, /^ministral-.*latest$/, /^mistral-medium-latest$/],
    exclude: NOT_CHAT,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    keyHint: 'sk-… (choose DeepSeek)',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    defaultModel: 'deepseek-flash',
    models: ['deepseek-flash', 'deepseek-v4-pro'],
    needsKey: true,
    prefer: ['deepseek-flash', /flash/, 'deepseek-chat'],
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (local)',
    keyHint: `No key: paste your Ollama URL (default ${OLLAMA_DEFAULT_URL})`,
    docsUrl: 'https://docs.ollama.com/api/openai-compatibility',
    defaultModel: '',
    models: [],
    needsKey: false,
    prefer: [/^llama3/, /^qwen/, /^gemma/, /^mistral/, /^gpt-oss/],
    exclude: /embed/i,
  },
};

export const PROVIDER_ORDER: ProviderId[] = [
  'openai',
  'anthropic',
  'gemini',
  'openrouter',
  'groq',
  'mistral',
  'deepseek',
  'ollama',
];

export const providerList = (): ProviderInfo[] =>
  PROVIDER_ORDER.map(id => {
    const { prefer: _p, exclude: _e, ...info } = PROVIDER_SPECS[id];
    return { ...info, models: [...info.models] };
  });

const looksLikeUrl = (v: string) => /^https?:\/\//i.test(v) || /^(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)(:\d+)?/i.test(v);

/**
 * Provider from the key's prefix. Order matters: `sk-ant-` and `sk-or-` before the
 * generic `sk-`. DeepSeek and Mistral keys have no distinctive prefix (DeepSeek's
 * `sk-…` looks like OpenAI's), so the user picks them explicitly.
 */
export function detectProvider(key: string): ProviderId | null {
  const k = key.trim();
  if (!k) return null;
  if (k.startsWith('sk-ant-')) return 'anthropic';
  if (k.startsWith('sk-or-')) return 'openrouter';
  if (k.startsWith('gsk_')) return 'groq';
  if (k.startsWith('AIza')) return 'gemini';
  if (k.startsWith('sk-proj-') || k.startsWith('sk-')) return 'openai';
  if (looksLikeUrl(k)) return 'ollama';
  return null;
}

/** Base URL for Ollama from what the user typed (blank → localhost). No trailing slash, no /v1. */
export function ollamaBase(input: string) {
  let v = input.trim() || OLLAMA_DEFAULT_URL;
  if (!/^https?:\/\//i.test(v)) v = `http://${v}`;
  return v.replace(/\/+$/, '').replace(/\/v1$/, '').replace(/\/api$/, '');
}

/** Pick the default model from a live models list (falls back to the static default). */
export function chooseModel(provider: ProviderId, available: string[]): string {
  const spec = PROVIDER_SPECS[provider];
  const usable = available.filter(id => !spec.exclude || !spec.exclude.test(id));
  for (const pref of spec.prefer) {
    const hit = typeof pref === 'string' ? usable.find(id => id === pref) : usable.find(id => pref.test(id));
    if (hit) return hit;
  }
  return usable[0] ?? spec.defaultModel;
}

/** Chat-capable models from a list, preferred ones first, capped for a picker. */
export function pickerModels(provider: ProviderId, available: string[], cap = 40): string[] {
  const spec = PROVIDER_SPECS[provider];
  const usable = [...new Set(available)].filter(id => !spec.exclude || !spec.exclude.test(id));
  const top: string[] = [];
  for (const pref of spec.prefer)
    for (const id of usable)
      if ((typeof pref === 'string' ? id === pref : pref.test(id)) && !top.includes(id)) top.push(id);
  return [...top, ...usable.filter(id => !top.includes(id)).sort()].slice(0, cap);
}

export type HttpRequest = { url: string; init: { method: string; headers: Record<string, string>; body?: string } };

const OPENAI_COMPAT_BASE: Partial<Record<ProviderId, string>> = {
  openai: 'https://api.openai.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  groq: 'https://api.groq.com/openai/v1',
  mistral: 'https://api.mistral.ai/v1',
  deepseek: 'https://api.deepseek.com',
};

const ANTHROPIC_HEADERS = (key: string) => ({
  'x-api-key': key,
  'anthropic-version': '2023-06-01',
  // Required for calls straight from a browser; the key never leaves this device otherwise.
  'anthropic-dangerous-direct-browser-access': 'true',
});

export const streamFormat = (p: ProviderId): 'openai' | 'anthropic' | 'gemini' =>
  p === 'anthropic' ? 'anthropic' : p === 'gemini' ? 'gemini' : 'openai';

/** The cheap call connect() uses to validate a key and learn the models. */
export function modelsRequest(provider: ProviderId, secret: string): HttpRequest {
  switch (provider) {
    case 'anthropic':
      return { url: 'https://api.anthropic.com/v1/models?limit=100', init: { method: 'GET', headers: ANTHROPIC_HEADERS(secret) } };
    case 'gemini':
      return {
        url: 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',
        init: { method: 'GET', headers: { 'x-goog-api-key': secret } },
      };
    case 'openrouter':
      // /models is public, so it would accept any key; /key actually checks it.
      return { url: 'https://openrouter.ai/api/v1/key', init: { method: 'GET', headers: { Authorization: `Bearer ${secret}` } } };
    case 'ollama':
      return { url: `${ollamaBase(secret)}/v1/models`, init: { method: 'GET', headers: {} } };
    default:
      return {
        url: `${OPENAI_COMPAT_BASE[provider]}/models`,
        init: { method: 'GET', headers: { Authorization: `Bearer ${secret}` } },
      };
  }
}

/** OpenRouter only: the public models list, fetched after /key passes. */
export const openRouterModelsUrl = 'https://openrouter.ai/api/v1/models';

/** Model IDs from a models-list response body. */
export function parseModels(provider: ProviderId, body: unknown): string[] {
  const b = body as { data?: { id?: string }[]; models?: { name?: string; supportedGenerationMethods?: string[] }[] };
  if (provider === 'gemini')
    return (b.models ?? [])
      .filter(m => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent'))
      .map(m => (m.name ?? '').replace(/^models\//, ''))
      .filter(Boolean);
  return (b.data ?? []).map(m => m.id ?? '').filter(Boolean);
}

// Generous because current models may spend part of it on hidden reasoning.
export const MAX_OUTPUT_TOKENS = 4096;

/** The streaming chat request for any provider. */
export function chatRequest(
  provider: ProviderId,
  secret: string,
  model: string,
  system: string,
  turns: Turn[],
): HttpRequest {
  if (provider === 'anthropic')
    return {
      url: 'https://api.anthropic.com/v1/messages',
      init: {
        method: 'POST',
        headers: { ...ANTHROPIC_HEADERS(secret), 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          max_tokens: MAX_OUTPUT_TOKENS,
          stream: true,
          system,
          messages: turns.map(t => ({ role: t.role, content: t.text })),
        }),
      },
    };
  if (provider === 'gemini')
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      init: {
        method: 'POST',
        headers: { 'x-goog-api-key': secret, 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map(t => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.text }] })),
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
        }),
      },
    };
  const base = provider === 'ollama' ? `${ollamaBase(secret)}/v1` : OPENAI_COMPAT_BASE[provider];
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (provider !== 'ollama') headers.Authorization = `Bearer ${secret}`;
  if (provider === 'openrouter') headers['X-Title'] = 'Grain to Mountain';
  return {
    url: `${base}/chat/completions`,
    init: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        stream: true,
        [provider === 'openai' ? 'max_completion_tokens' : 'max_tokens']: MAX_OUTPUT_TOKENS,
        ...(provider === 'openai' && /^(gpt-[5-9]|o\d)/.test(model) ? { reasoning_effort: 'low' } : {}),
        messages: [{ role: 'system', content: system }, ...turns.map(t => ({ role: t.role, content: t.text }))],
      }),
    },
  };
}

/** What the UI may show instead of the key: last 4 characters only (Ollama: its host). */
export function keyPreview(provider: ProviderId, secret: string) {
  if (provider === 'ollama') {
    try {
      return new URL(ollamaBase(secret)).host;
    } catch {
      return 'local';
    }
  }
  const s = secret.trim();
  return s.length <= 4 ? '••••' : `••••${s.slice(-4)}`;
}
