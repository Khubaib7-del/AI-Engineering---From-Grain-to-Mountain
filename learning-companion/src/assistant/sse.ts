// Incremental Server-Sent Events parsing plus per-provider delta extraction.
// Pure: feed it text chunks as they arrive, get text deltas out.

export type SseEvent = { event?: string; data: string };

/** Line-buffered SSE parser (WHATWG rules: `event:`/`data:` fields, blank line ends an event, `:` comments ignored). */
export function createSseParser(onEvent: (e: SseEvent) => void) {
  let buffer = '';
  let event: string | undefined;
  let data: string[] = [];
  const dispatch = () => {
    if (data.length) onEvent({ event, data: data.join('\n') });
    event = undefined;
    data = [];
  };
  const line = (raw: string) => {
    const l = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    if (l === '') return dispatch();
    if (l.startsWith(':')) return;
    const i = l.indexOf(':');
    const field = i === -1 ? l : l.slice(0, i);
    let value = i === -1 ? '' : l.slice(i + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') event = value;
    else if (field === 'data') data.push(value);
  };
  return {
    push(chunk: string) {
      buffer += chunk;
      let nl: number;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        line(buffer.slice(0, nl));
        buffer = buffer.slice(nl + 1);
      }
    },
    end() {
      if (buffer) line(buffer);
      buffer = '';
      dispatch();
    },
  };
}

export type Delta = { text?: string; error?: string; done?: boolean };

const safeJson = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
};

/** OpenAI-compatible chat.completion.chunk (OpenAI, OpenRouter, Groq, Mistral, DeepSeek, Ollama). */
export function openaiDelta(e: SseEvent): Delta {
  if (e.data.trim() === '[DONE]') return { done: true };
  const j = safeJson(e.data) as
    | { error?: { message?: string } | string; choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[] }
    | undefined;
  if (!j) return {};
  if (j.error) return { error: typeof j.error === 'string' ? j.error : (j.error.message ?? 'The provider reported an error.') };
  const c = j.choices?.[0];
  const text = c?.delta?.content ?? undefined;
  // reasoning_content (DeepSeek/Groq/OpenRouter "reasoning") is deliberately not shown.
  return text ? { text } : {};
}

/** Anthropic Messages streaming events. Thinking deltas are skipped. */
export function anthropicDelta(e: SseEvent): Delta {
  const j = safeJson(e.data) as
    | { type?: string; delta?: { type?: string; text?: string }; error?: { message?: string } }
    | undefined;
  if (!j) return {};
  const type = j.type ?? e.event;
  if (type === 'error') return { error: j.error?.message ?? 'Claude reported an error.' };
  if (type === 'message_stop') return { done: true };
  if (type === 'content_block_delta' && j.delta?.type === 'text_delta' && j.delta.text) return { text: j.delta.text };
  return {};
}

/** Gemini streamGenerateContent?alt=sse chunks. Thought parts are skipped. */
export function geminiDelta(e: SseEvent): Delta {
  const j = safeJson(e.data) as
    | {
        error?: { message?: string };
        promptFeedback?: { blockReason?: string };
        candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
      }
    | undefined;
  if (!j) return {};
  if (j.error) return { error: j.error.message ?? 'Gemini reported an error.' };
  if (j.promptFeedback?.blockReason) return { error: `Gemini blocked this prompt (${j.promptFeedback.blockReason}).` };
  const c = j.candidates?.[0];
  const text = (c?.content?.parts ?? [])
    .filter(p => !p.thought && p.text)
    .map(p => p.text)
    .join('');
  const out: Delta = {};
  if (text) out.text = text;
  if (c?.finishReason && c.finishReason !== 'STOP' && c.finishReason !== 'MAX_TOKENS' && !text)
    out.error = `Gemini stopped early (${c.finishReason}).`;
  return out;
}

export const deltaFor = (format: 'openai' | 'anthropic' | 'gemini') =>
  format === 'anthropic' ? anthropicDelta : format === 'gemini' ? geminiDelta : openaiDelta;

/** Parse a whole SSE body (used by tests and by the non-streaming fallback). */
export function parseSseText(format: 'openai' | 'anthropic' | 'gemini', body: string) {
  const out: Delta[] = [];
  const d = deltaFor(format);
  const p = createSseParser(e => out.push(d(e)));
  p.push(body);
  p.end();
  return {
    text: out.map(x => x.text ?? '').join(''),
    error: out.find(x => x.error)?.error,
    done: out.some(x => x.done),
  };
}
