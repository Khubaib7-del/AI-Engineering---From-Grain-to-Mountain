// Network layer: validate a key and stream a reply, straight from the device to
// the provider. `fetchImpl` is injected (expo/fetch on native for streaming
// bodies, the browser fetch on web, a fake in tests). Never logs.
import { chatRequest, chooseModel, modelsRequest, openRouterModelsUrl, parseModels, pickerModels, streamFormat } from './providers';
import { createSseParser, deltaFor } from './sse';
import { AssistantError, httpError, networkError, redactSecrets } from './errors';
import type { ProviderId, Turn } from './types';

type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string; signal?: AbortSignal },
) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
  body?: { getReader(): { read(): Promise<{ done: boolean; value?: Uint8Array }>; cancel?(): Promise<void> } } | null;
}>;

export type ClientEnv = { fetch: FetchLike; isWeb: boolean };

async function call(env: ClientEnv, provider: ProviderId, secret: string, url: string, init: Parameters<FetchLike>[1]) {
  try {
    return await env.fetch(url, init);
  } catch (e) {
    throw networkError(provider, e, env.isWeb);
  }
}

/** Validate the key with a models-list call and choose a default model. */
export async function validateKey(env: ClientEnv, provider: ProviderId, secret: string, signal?: AbortSignal) {
  const req = modelsRequest(provider, secret);
  const res = await call(env, provider, secret, req.url, { ...req.init, signal });
  if (!res.ok) throw httpError(provider, res.status, await res.text().catch(() => ''), secret);
  let ids: string[];
  if (provider === 'openrouter') {
    const list = await call(env, provider, secret, openRouterModelsUrl, { method: 'GET', headers: {}, signal });
    ids = list.ok ? parseModels(provider, await list.json().catch(() => ({}))) : [];
  } else ids = parseModels(provider, await res.json().catch(() => ({})));
  if (provider === 'ollama' && !ids.length)
    throw new AssistantError('Ollama is running but has no models. Run `ollama pull llama3.2` (or any model) first.', 'model');
  return { model: chooseModel(provider, ids), models: pickerModels(provider, ids) };
}

/** Stream a reply; calls onText with each new piece. Resolves with the full text. */
export async function streamReply(
  env: ClientEnv,
  opts: { provider: ProviderId; secret: string; model: string; system: string; turns: Turn[]; signal?: AbortSignal },
  onText: (piece: string) => void,
): Promise<string> {
  const { provider, secret } = opts;
  const req = chatRequest(provider, secret, opts.model, opts.system, opts.turns);
  const res = await call(env, provider, secret, req.url, { ...req.init, signal: opts.signal });
  if (!res.ok) throw httpError(provider, res.status, await res.text().catch(() => ''), secret);
  const toDelta = deltaFor(streamFormat(provider));
  let full = '';
  let failure: string | undefined;
  const parser = createSseParser(e => {
    const d = toDelta(e);
    if (d.error) failure ??= redactSecrets(d.error, secret);
    if (d.text) {
      full += d.text;
      onText(d.text);
    }
  });
  try {
    const reader = res.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) parser.push(decoder.decode(value, { stream: true }));
      }
      parser.push(decoder.decode());
    } else parser.push(await res.text()); // No streaming body available: parse it all at once.
    parser.end();
  } catch (e) {
    throw networkError(provider, e, env.isWeb);
  }
  if (failure && !full) throw new AssistantError(failure, 'other');
  if (!full && !failure) throw new AssistantError('The model returned an empty reply. Try again or pick another model.', 'other');
  return full;
}
