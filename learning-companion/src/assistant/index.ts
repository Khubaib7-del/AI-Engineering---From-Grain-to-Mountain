// Public surface of the assistant engine. The UI imports ONLY from here
// (docs/assistant-contract.md).
export type { AssistantStatus, ChatMessage, NextStep, ProviderId, ProviderInfo } from './types';
export { useAssistant } from './use-assistant';
export { useNextSteps } from './use-next-steps';
export { detectProvider, providerList } from './providers';
export { keyStorageKind } from './key-store';
export type { NextSteps } from './next-steps';
