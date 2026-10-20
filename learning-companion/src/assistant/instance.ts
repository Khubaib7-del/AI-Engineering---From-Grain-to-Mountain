// The app's single engine, wired to this platform's storage and fetch.
import { createEngine } from './engine';
import { clientEnv } from './fetcher';
import { deleteSecret, readSecret, writeSecret } from './key-store';
import { localGet, localKeys, localRemove, localSet } from './local-store';

export const engine = createEngine({
  env: clientEnv,
  readSecret,
  writeSecret,
  deleteSecret,
  localGet,
  localSet,
  localRemove,
  localKeys,
});
