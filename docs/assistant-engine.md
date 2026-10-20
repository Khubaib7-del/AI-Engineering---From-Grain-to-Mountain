# Assistant engine (src/assistant)

Implements `docs/assistant-contract.md`. UI imports only from `learning-companion/src/assistant/index.ts`.

## Exports

- `useAssistant()`: the contract API, plus three extras the UI may use: `models` (chat models the key can use, preferred first, for a model picker), `streaming` (a reply is in flight), and `keyStorageKind` (`'secure-store'` on native, `'local-storage'` on web, so the UI can show the web warning).
- `useNextSteps()`: `{ now, then, tip }`. Deterministic and needs no key.
- `detectProvider`, `providerList`, and the types `ProviderId`, `ProviderInfo`, `ChatMessage`, `NextStep`, `AssistantStatus`.

There is one app-wide engine (a `useSyncExternalStore` singleton), so no Provider is needed in `_layout`. Every `useAssistant()` call shares the same connection and thread.

## Files

| File | Role |
|---|---|
| `providers.ts` | Catalogue, prefix detection, model choice from the live list, request builders (pure) |
| `sse.ts` | Incremental SSE parser and OpenAI-compatible / Anthropic / Gemini delta extractors (pure) |
| `errors.ts` | Friendly errors (bad key, quota, rate limit, model, CORS/network, server) and `redactSecrets` |
| `client.ts` | `validateKey` (models-list call) and `streamReply` (fetch + stream reader); fetch is injected |
| `grounding.ts` | Socratic tutor system prompt: unit outcomes, learn slice, covers, gaps, read, practice/done_when, week plan, track, progress. Quiz answers, explanations and rubrics are never included |
| `history.ts` | Per-unit thread keys, caps (60 messages / 40k chars / 8k per message), turns sent (last 16), scrubbing |
| `next-steps.ts` | now/then from `stepsDone`, the planned day lines in weeks.json (indexed by distinct study days on the unit), quiz attempts, spaced recall (1/3/7/14/30 days after a pass), streak and rest tips |
| `engine.ts` | Store: connect, disconnect, setModel, send, stop (AbortController), clear, setUnit |
| `key-store(.web).ts` | Key: `expo-secure-store` with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` on native; `localStorage` on web |
| `local-store(.web).ts` | Non-secret data (provider/model choice, chat threads): `expo-sqlite/kv-store` on native; `localStorage` on web |
| `fetcher(.web).ts` | `expo/fetch` on native (streams bodies); browser fetch on web |

## Key safety

- The key is kept only in the secure store (native) or localStorage (web). It is never in the store snapshot the UI reads, never in `LearningState` (so it is never synced to Supabase), and never in the chat history.
- `keyPreview` shows the last 4 characters only.
- Anything that looks like a key is scrubbed from chat text before it is shown, sent or persisted, and from provider error messages.
- `src/assistant` has no `console.*` calls (a test enforces this).
- `disconnect()` wipes the key, the saved config and every chat thread.
- Requests go straight from the device to the provider. Gemini gets the key in the `x-goog-api-key` header, never in the URL.

## Providers (checked 2026-10-21)

| Provider | Validate | Chat | Default (first match in the live list wins) |
|---|---|---|---|
| OpenAI | `GET /v1/models` | `/v1/chat/completions` | `gpt-6-luna` |
| Anthropic | `GET /v1/models` | `/v1/messages` (+ `anthropic-dangerous-direct-browser-access`) | `claude-haiku-5-5` |
| Gemini | `GET /v1beta/models` | `:streamGenerateContent?alt=sse` | `gemini-3.8-flash` |
| OpenRouter | `GET /api/v1/key`, then public `/models` | `/api/v1/chat/completions` | `google/gemini-3.8-flash` |
| Groq | `GET /openai/v1/models` | OpenAI-compatible | `openai/gpt-oss-20b` |
| Mistral | `GET /v1/models` | OpenAI-compatible | `mistral-small-latest` |
| DeepSeek | `GET /models` | OpenAI-compatible | `deepseek-flash` |
| Ollama | `GET {url}/v1/models` | `{url}/v1/chat/completions` | first local chat model |

Sources: Anthropic models overview, ai.google.dev/gemini-api/docs/models, platform.openai.com/docs/models, console.groq.com/docs/models, docs.mistral.ai models overview, api-docs.deepseek.com pricing, the live OpenRouter `/api/v1/models` list, and OpenRouter's limits docs (for `/key`).

CORS preflights from an `https://*.vercel.app` origin were probed live on 2026-10-21. All seven cloud APIs allow browser calls, both the models list and chat endpoints. A bad key returns 401 everywhere (Gemini returns 400/403).

## Caveats

- No real keys were available, so live chat streaming was not exercised end to end. Request shapes follow each provider's docs, and the parsers are covered by fixture tests.
- OpenAI is called through Chat Completions, not the newer Responses API. `reasoning_effort: "low"` is sent for gpt-5+/o-series models.
- Ollama from the deployed web app needs `OLLAMA_ORIGINS` set to the site's origin. On a phone, `localhost` is the phone itself, so it needs a LAN URL.
- On web the key sits in localStorage, so the UI should show the warning (`keyStorageKind === 'local-storage'`).
- DeepSeek keys look like OpenAI keys (`sk-…`), so the picker must pass `provider: 'deepseek'`. Mistral keys have no prefix.
