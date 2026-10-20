// Web non-secret storage (chat threads, chosen provider/model) in localStorage.
const ls = () => globalThis.localStorage;
export const localGet = async (key: string) => {
  try {
    return ls()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
export const localSet = async (key: string, value: string) => {
  ls().setItem(key, value);
};
export const localRemove = async (key: string) => {
  try {
    ls()?.removeItem(key);
  } catch {
    // ignore
  }
};
export const localKeys = async () => {
  const s = ls();
  return s ? Array.from({ length: s.length }, (_, i) => s.key(i) ?? '').filter(Boolean) : [];
};
