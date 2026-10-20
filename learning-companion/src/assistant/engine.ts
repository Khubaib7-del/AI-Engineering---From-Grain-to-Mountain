// One app-wide assistant store (no Provider needed): connection, model, the
// per-unit chat thread and the in-flight stream. React reads it through
// useSyncExternalStore in use-assistant.ts. The secret lives only in this
// module's closure and in device storage; it is never part of the snapshot.
import { validateKey, streamReply, type ClientEnv } from './client';
import { AssistantError, redactSecrets } from './errors';
import { capHistory, newId, parseHistory, serializeHistory, threadKey, toTurns } from './history';
import { detectProvider, keyPreview, ollamaBase, PROVIDER_SPECS } from './providers';
import type { AssistantStatus, ChatMessage, ProviderId } from './types';

export type Snapshot = {
  status: AssistantStatus;
  error?: string;
  config?: { provider: ProviderId; model: string; keyPreview: string };
  models: string[];
  unitId?: string;
  messages: ChatMessage[];
  streaming: boolean;
};

export type EngineDeps = {
  env: ClientEnv;
  readSecret(): Promise<string | null>;
  writeSecret(v: string): Promise<void>;
  deleteSecret(): Promise<void>;
  localGet(k: string): Promise<string | null>;
  localSet(k: string, v: string): Promise<void>;
  localRemove(k: string): Promise<void>;
  localKeys(): Promise<string[]>;
};

const CONFIG_KEY = 'assistant-config:v1';
type StoredConfig = { provider: ProviderId; model: string; models?: string[] };

export function createEngine(deps: EngineDeps) {
  let snap: Snapshot = { status: 'unconfigured', models: [], messages: [], streaming: false };
  let secret: string | null = null;
  let abort: AbortController | null = null;
  let loaded: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const set = (patch: Partial<Snapshot>) => {
    snap = { ...snap, ...patch };
    listeners.forEach(l => l());
  };

  const persistThread = async (unitId: string | undefined, messages: ChatMessage[]) => {
    try {
      if (messages.length) await deps.localSet(threadKey(unitId), serializeHistory(messages, secret ?? undefined));
      else await deps.localRemove(threadKey(unitId));
    } catch {
      // Storage full or unavailable: the chat still works for this session.
    }
  };

  const loadThread = async (unitId?: string) => parseHistory(await deps.localGet(threadKey(unitId)).catch(() => null));

  function load() {
    loaded ??= (async () => {
      const [s, rawConfig, messages] = await Promise.all([
        deps.readSecret(),
        deps.localGet(CONFIG_KEY).catch(() => null),
        loadThread(snap.unitId),
      ]);
      let config: StoredConfig | undefined;
      try {
        config = rawConfig ? (JSON.parse(rawConfig) as StoredConfig) : undefined;
      } catch {
        config = undefined;
      }
      const usable = config && PROVIDER_SPECS[config.provider] && (s !== null || !PROVIDER_SPECS[config.provider].needsKey);
      if (usable && config) {
        secret = s ?? '';
        set({
          status: 'ready',
          config: { provider: config.provider, model: config.model, keyPreview: keyPreview(config.provider, secret) },
          models: config.models ?? [],
          messages: snap.messages.length ? snap.messages : messages,
        });
      } else set({ messages: snap.messages.length ? snap.messages : messages });
    })();
    return loaded;
  }

  async function connect(key: string, provider?: ProviderId, model?: string) {
    await load();
    const input = key.trim();
    const id = provider ?? detectProvider(input);
    if (!id) {
      set({
        status: 'error',
        error: input
          ? 'Could not tell which provider this key is for. Pick it from the list (DeepSeek and Mistral keys need this).'
          : 'Paste an API key first.',
      });
      return;
    }
    if (PROVIDER_SPECS[id].needsKey && !input) {
      set({ status: 'error', error: `Paste your ${PROVIDER_SPECS[id].name} API key.` });
      return;
    }
    const value = id === 'ollama' ? ollamaBase(input) : input;
    set({ status: 'checking', error: undefined });
    try {
      const found = await validateKey(deps.env, id, value);
      const chosen = model?.trim() || found.model;
      await deps.writeSecret(value);
      const stored: StoredConfig = { provider: id, model: chosen, models: found.models };
      await deps.localSet(CONFIG_KEY, JSON.stringify(stored));
      secret = value;
      set({
        status: 'ready',
        error: undefined,
        config: { provider: id, model: chosen, keyPreview: keyPreview(id, value) },
        models: found.models,
      });
    } catch (e) {
      const message =
        e instanceof AssistantError
          ? e.message
          : redactSecrets(`Could not save the key: ${(e as Error)?.message ?? 'unknown error'}`, value);
      // A previously working connection stays saved; only this attempt failed.
      set({ status: 'error', error: message });
    }
  }

  async function disconnect() {
    abort?.abort();
    abort = null;
    secret = null;
    await deps.deleteSecret();
    await deps.localRemove(CONFIG_KEY);
    const keys = await deps.localKeys();
    await Promise.all(keys.filter(k => k.startsWith('assistant-chat:')).map(k => deps.localRemove(k)));
    set({ status: 'unconfigured', error: undefined, config: undefined, models: [], messages: [], streaming: false });
  }

  function setModel(model: string) {
    const c = snap.config;
    if (!c || !model.trim()) return;
    const next = { ...c, model: model.trim() };
    set({ config: next, error: undefined, status: secret !== null ? 'ready' : snap.status });
    void deps
      .localSet(CONFIG_KEY, JSON.stringify({ provider: next.provider, model: next.model, models: snap.models }))
      .catch(() => undefined);
  }

  async function send(text: string, system: string) {
    await load();
    const c = snap.config;
    const clean = redactSecrets(text.trim(), secret ?? undefined);
    if (!clean) return;
    if (!c || secret === null) {
      set({ status: snap.status === 'checking' ? 'checking' : 'unconfigured', error: 'Connect an AI provider first.' });
      return;
    }
    abort?.abort();
    const controller = new AbortController();
    abort = controller;
    const unitId = snap.unitId;
    const user: ChatMessage = { id: newId(), role: 'user', text: clean, at: new Date().toISOString(), status: 'done' };
    const reply: ChatMessage = { id: newId(), role: 'assistant', text: '', at: new Date().toISOString(), status: 'streaming' };
    const history = capHistory([
      ...snap.messages.map(m => (m.status === 'streaming' ? { ...m, status: 'done' as const } : m)),
      user,
    ]);
    set({ messages: [...history, reply], streaming: true, error: undefined });
    const update = (patch: Partial<ChatMessage>) => {
      if (snap.unitId !== unitId) return; // Thread switched mid-stream.
      set({ messages: snap.messages.map(m => (m.id === reply.id ? { ...m, ...patch } : m)) });
    };
    let partial = '';
    try {
      const full = await streamReply(
        deps.env,
        { provider: c.provider, secret, model: c.model, system, turns: toTurns(history), signal: controller.signal },
        piece => {
          partial += piece;
          update({ text: partial });
        },
      );
      update({ text: full, status: 'done' });
    } catch (e) {
      const err = e instanceof AssistantError ? e : new AssistantError(redactSecrets(String((e as Error)?.message ?? e), secret ?? undefined), 'other');
      if (err.kind === 'aborted') update({ text: partial || '(stopped)', status: 'done' });
      else {
        update({ text: partial ? `${partial}\n\n— ${err.message}` : err.message, status: 'error' });
        if (snap.unitId === unitId) set({ error: err.message });
      }
    } finally {
      if (abort === controller) abort = null;
      if (snap.unitId === unitId) {
        set({ streaming: false });
        await persistThread(unitId, snap.messages);
      }
    }
  }

  function stop() {
    abort?.abort();
  }

  function clear() {
    abort?.abort();
    set({ messages: [], error: undefined });
    void persistThread(snap.unitId, []);
  }

  async function setUnit(id?: string) {
    if (id === snap.unitId) return;
    abort?.abort();
    set({ unitId: id, messages: [], streaming: false });
    const messages = await loadThread(id);
    if (snap.unitId === id) set({ messages });
  }

  return {
    subscribe(l: () => void) {
      listeners.add(l);
      void load();
      return () => listeners.delete(l);
    },
    getSnapshot: () => snap,
    connect,
    disconnect,
    setModel,
    send,
    stop,
    clear,
    setUnit,
    /** Test hook: wait for the initial load. */
    ready: () => load(),
  };
}

export type Engine = ReturnType<typeof createEngine>;
