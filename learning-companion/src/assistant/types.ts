// Public assistant types (docs/assistant-contract.md). The UI imports these
// through src/assistant/index.ts only.
export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'mistral'
  | 'deepseek'
  | 'ollama';

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

/** What is saved on the device. `secret` is the API key (or the Ollama base URL). */
export type SavedConfig = { provider: ProviderId; model: string; secret: string; models?: string[] };

/** Wire format sent to a provider: system prompt kept separate, then the turns. */
export type Turn = { role: 'user' | 'assistant'; text: string };
