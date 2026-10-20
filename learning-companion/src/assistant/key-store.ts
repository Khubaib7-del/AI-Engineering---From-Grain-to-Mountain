// Native key storage: the OS keychain/keystore via expo-secure-store. The key is
// never synced (not part of LearningState / Supabase) and never logged.
import * as SecureStore from 'expo-secure-store';

const KEY = 'g2m.assistant.secret.v1';
const OPTIONS: SecureStore.SecureStoreOptions = {
  // iOS: stays on this device only (no iCloud Keychain sync, not restored to another device).
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const keyStorageKind = 'secure-store' as const;

export async function readSecret(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY, OPTIONS);
  } catch {
    return null;
  }
}
export async function writeSecret(value: string) {
  await SecureStore.setItemAsync(KEY, value, OPTIONS);
}
export async function deleteSecret() {
  await SecureStore.deleteItemAsync(KEY, OPTIONS).catch(() => undefined);
}
