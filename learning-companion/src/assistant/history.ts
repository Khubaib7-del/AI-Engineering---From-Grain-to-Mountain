// Chat history rules: per-unit thread keys, size caps, what is sent to the model,
// and scrubbing before anything is persisted. Pure.
import { redactSecrets } from './errors';
import type { ChatMessage, Turn } from './types';

export const HISTORY_MAX_MESSAGES = 60;
export const HISTORY_MAX_CHARS = 40_000;
export const MESSAGE_MAX_CHARS = 8_000;
/** Turns sent with each request (older ones stay visible but are not resent). */
export const CONTEXT_TURNS = 16;

export const threadKey = (unitId?: string) => `assistant-chat:${unitId || 'general'}`;

/** Keep the newest messages within both caps. */
export function capHistory(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  let chars = 0;
  for (let i = messages.length - 1; i >= 0 && out.length < HISTORY_MAX_MESSAGES; i--) {
    const m = messages[i];
    const text = m.text.length > MESSAGE_MAX_CHARS ? m.text.slice(0, MESSAGE_MAX_CHARS) : m.text;
    if (chars + text.length > HISTORY_MAX_CHARS && out.length) break;
    chars += text.length;
    out.unshift(text === m.text ? m : { ...m, text });
  }
  return out;
}

/** What gets written to disk: capped, finished messages only, secrets scrubbed. */
export function serializeHistory(messages: ChatMessage[], secret?: string): string {
  const clean = capHistory(messages)
    .filter(m => m.role !== 'system')
    .map(m => ({
      id: m.id,
      role: m.role,
      at: m.at,
      text: redactSecrets(m.text, secret),
      status: m.status === 'streaming' ? ('done' as const) : m.status,
    }));
  return JSON.stringify({ v: 1, messages: clean });
}

export function parseHistory(raw: string | null): ChatMessage[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw) as { messages?: ChatMessage[] };
    return (j.messages ?? []).filter(
      m => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'assistant') && typeof m.id === 'string',
    );
  } catch {
    return [];
  }
}

/** Conversation turns for the request: recent finished messages, alternating roles, starting with the user. */
export function toTurns(messages: ChatMessage[]): Turn[] {
  const turns: Turn[] = [];
  for (const m of messages) {
    if (m.role === 'system' || m.status === 'error' || !m.text.trim()) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.text += `\n\n${m.text}`;
    else turns.push({ role: m.role, text: m.text });
  }
  let recent = turns.slice(-CONTEXT_TURNS);
  while (recent.length && recent[0].role !== 'user') recent = recent.slice(1);
  return recent;
}

let counter = 0;
export const newId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
