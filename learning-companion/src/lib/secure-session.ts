type SecureAdapter = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};
const prefix = 'secure-chunks-v1:';
type Manifest = {slot: number; count: number};
function manifest(raw: string | null): Manifest | null {
  if (!raw?.startsWith(prefix)) return null;
  const value = JSON.parse(raw.slice(prefix.length));
  if (![0, 1].includes(value.slot) || !Number.isInteger(value.count) || value.count < 1 || value.count > 256) throw new Error('Invalid saved session');
  return value;
}
// Keep every native value below historical 2KB limits, including Unicode.
// Commit the manifest last so a failed refresh preserves the prior session.
export function secureSessionStorage(adapter: SecureAdapter) {
  const part = (key: string, slot: number, index: number) => `${key}.part.${slot}.${index}`;
  const clean = async (key: string, saved: Manifest) => {
    await Promise.allSettled(Array.from({length: saved.count}, (_, i) => adapter.deleteItemAsync(part(key, saved.slot, i))));
  };
  return {
    async getItem(key: string) {
      const raw = await adapter.getItemAsync(key), saved = manifest(raw);
      if (!saved) return raw; // Read the previous direct SecureStore format.
      const parts = await Promise.all(Array.from({length: saved.count}, (_, i) => adapter.getItemAsync(part(key, saved.slot, i))));
      if (parts.some(value => value === null)) throw new Error('Saved session is incomplete');
      return parts.join('');
    },
    async setItem(key: string, value: string) {
      const previous = manifest(await adapter.getItemAsync(key));
      const points = Array.from(value), count = Math.max(1, Math.ceil(points.length / 400));
      if (count > 256) throw new Error('Session is too large to save securely');
      const next = {slot: previous?.slot === 0 ? 1 : 0, count};
      try {
        for (let i = 0; i < count; i++) await adapter.setItemAsync(part(key, next.slot, i), points.slice(i * 400, (i + 1) * 400).join(''));
        await adapter.setItemAsync(key, prefix + JSON.stringify(next));
      } catch (error) { await clean(key, next); throw error; }
      if (previous) await clean(key, previous);
    },
    async removeItem(key: string) {
      const previous = manifest(await adapter.getItemAsync(key));
      await adapter.deleteItemAsync(key);
      if (previous) await clean(key, previous);
    },
  };
}
