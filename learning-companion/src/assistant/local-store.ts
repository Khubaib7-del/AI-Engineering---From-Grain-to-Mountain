// Native non-secret storage (chat threads, chosen provider/model) in SQLite KV.
import Storage from 'expo-sqlite/kv-store';

export const localGet = (key: string) => Storage.getItemAsync(key).catch(() => null);
export const localSet = (key: string, value: string) => Storage.setItemAsync(key, value);
export const localRemove = async (key: string) => {
  await Storage.removeItemAsync(key).catch(() => false);
};
export const localKeys = () => Storage.getAllKeysAsync().catch(() => [] as string[]);
