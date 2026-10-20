// The ONE door from the UI to the assistant engine. Today it re-exports the local
// stub; at merge change the line below to `export * from '../assistant';` and
// delete src/assistant-stub.ts. Nothing else in the UI imports the engine.
export { useAssistant, useNextSteps } from '../assistant-stub';
export type { AssistantStatus, ChatMessage, NextStep, ProviderId, ProviderInfo } from '../assistant-stub';
