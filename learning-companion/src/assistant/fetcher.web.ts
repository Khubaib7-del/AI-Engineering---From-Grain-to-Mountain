// Web: the browser's fetch streams bodies natively.
import type { ClientEnv } from './client';

export const clientEnv: ClientEnv = {
  fetch: ((url, init) => globalThis.fetch(url, init)) as ClientEnv['fetch'],
  isWeb: true,
};
