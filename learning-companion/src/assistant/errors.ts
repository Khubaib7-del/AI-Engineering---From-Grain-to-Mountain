// Friendly, actionable error messages, with any secret scrubbed out. Pure.
import { PROVIDER_SPECS } from './providers';
import type { ProviderId } from './types';

export class AssistantError extends Error {
  constructor(
    message: string,
    public kind: 'bad-key' | 'quota' | 'rate' | 'model' | 'cors' | 'network' | 'server' | 'aborted' | 'other',
  ) {
    super(message);
    this.name = 'AssistantError';
  }
}

/** Patterns that look like API keys from any supported provider. */
const KEY_PATTERNS = [
  /sk-ant-[A-Za-z0-9_-]{8,}/g,
  /sk-or-[A-Za-z0-9_-]{8,}/g,
  /sk-proj-[A-Za-z0-9_-]{8,}/g,
  /sk-[A-Za-z0-9_-]{16,}/g,
  /gsk_[A-Za-z0-9]{16,}/g,
  /AIza[A-Za-z0-9_-]{20,}/g,
];

/** Remove the user's key (and anything key-shaped) from text before it is shown, stored or logged. */
export function redactSecrets(text: string, secret?: string): string {
  let out = text;
  const s = secret?.trim();
  if (s && s.length >= 8) out = out.split(s).join('[key hidden]');
  for (const p of KEY_PATTERNS) out = out.replace(p, '[key hidden]');
  return out;
}

const messageOf = (body: string) => {
  try {
    const j = JSON.parse(body) as {
      error?: { message?: string; status?: string; code?: string | number; type?: string } | string;
      detail?: string;
      message?: string;
    };
    if (typeof j.error === 'string') return j.error;
    return j.error?.message ?? j.detail ?? j.message ?? '';
  } catch {
    return body.slice(0, 200);
  }
};

/** Map an HTTP failure to a message a learner can act on. */
export function httpError(provider: ProviderId, status: number, body: string, secret?: string): AssistantError {
  const name = PROVIDER_SPECS[provider].name;
  const raw = redactSecrets(messageOf(body), secret);
  const lower = raw.toLowerCase();
  const keysAt = PROVIDER_SPECS[provider].docsUrl;
  if (
    status === 401 ||
    (status === 403 && /key|auth|permission|scope/.test(lower)) ||
    (status === 400 && /api[_ ]?key/.test(lower))
  )
    return new AssistantError(`${name} rejected this key. Check you copied all of it, or create a new one at ${keysAt}.`, 'bad-key');
  if (status === 402 || /quota|insufficient|credit|billing|balance/.test(lower))
    return new AssistantError(`${name} says this key has no credit or quota left. Add credit or check billing, then try again.`, 'quota');
  if (status === 429)
    return new AssistantError(`${name} is rate-limiting this key. Wait a minute and try again.`, 'rate');
  if (status === 404 || /model/.test(lower))
    return new AssistantError(`${name} could not use that model${raw ? ` (${raw})` : ''}. Pick another model.`, 'model');
  if (status >= 500)
    return new AssistantError(`${name} is having trouble right now (HTTP ${status}). Try again shortly.`, 'server');
  return new AssistantError(`${name} returned HTTP ${status}${raw ? `: ${raw}` : ''}.`, 'other');
}

/** fetch() threw: offline, DNS, or (on the web) a CORS block, which looks the same to the page. */
export function networkError(provider: ProviderId, error: unknown, isWeb: boolean): AssistantError {
  if ((error as { name?: string })?.name === 'AbortError') return new AssistantError('Stopped.', 'aborted');
  const name = PROVIDER_SPECS[provider].name;
  if (provider === 'ollama')
    return new AssistantError(
      isWeb
        ? 'Could not reach Ollama. Make sure it is running, and allow this site by starting it with OLLAMA_ORIGINS set to this page’s address.'
        : 'Could not reach Ollama. Make sure it is running and the URL is reachable from this phone (not localhost).',
      'network',
    );
  return new AssistantError(
    isWeb
      ? `Could not reach ${name}. Check your connection; if it persists, a browser extension or network may be blocking the request (CORS).`
      : `Could not reach ${name}. Check your internet connection.`,
    isWeb ? 'cors' : 'network',
  );
}
