// Web key storage: localStorage on this browser only. Browsers have no secure
// enclave for web pages, so the UI must warn: anyone with access to this browser
// profile (or a malicious extension) could read it. Never synced, never logged.
const KEY = 'g2m.assistant.secret.v1';

export const keyStorageKind = 'local-storage' as const;

export async function readSecret(): Promise<string | null> {
  try {
    return globalThis.localStorage?.getItem(KEY) ?? null;
  } catch {
    return null;
  }
}
export async function writeSecret(value: string) {
  globalThis.localStorage.setItem(KEY, value);
}
export async function deleteSecret() {
  try {
    globalThis.localStorage?.removeItem(KEY);
  } catch {
    // Storage disabled: nothing to wipe.
  }
}
