# Assistant contract (shared by UI agent and engine agent)

Engine lives in `learning-companion/src/assistant/` (engine agent owns it). UI imports ONLY from `src/assistant/index.ts`.

```ts
export type ProviderId = 'openai'|'anthropic'|'gemini'|'openrouter'|'groq'|'mistral'|'deepseek'|'ollama';
export type ProviderInfo = { id: ProviderId; name: string; keyHint: string; docsUrl: string; defaultModel: string; models: string[]; needsKey: boolean };
export type ChatMessage = { id: string; role: 'user'|'assistant'|'system'; text: string; at: string; status?: 'streaming'|'done'|'error' };
export type NextStep = { id: string; label: string; detail?: string; href?: string; kind: 'learn'|'read'|'practice'|'assess'|'review'|'rest' };
export type AssistantStatus = 'unconfigured'|'checking'|'ready'|'error';
export function useAssistant(): {
  status: AssistantStatus; error?: string;
  providers: ProviderInfo[];
  config?: { provider: ProviderId; model: string; keyPreview: string };
  detectProvider(key: string): ProviderId | null;      // from key prefix
  connect(key: string, provider?: ProviderId, model?: string): Promise<void>; // validates, picks model, saves
  disconnect(): Promise<void>;
  setModel(model: string): void;
  messages: ChatMessage[]; send(text: string): Promise<void>; stop(): void; clear(): void;
  context: { unitId?: string; setUnit(id?: string): void }; // grounds answers in current unit
};
// Works with NO key: deterministic, computed from progress + weeks.json
export function useNextSteps(): { now: NextStep; then: NextStep[]; tip?: string };
```
Keys: stored only on device (expo-secure-store native; localStorage on web, with clear warning). Never synced to Supabase, never logged. Requests go browser/app → provider directly.
