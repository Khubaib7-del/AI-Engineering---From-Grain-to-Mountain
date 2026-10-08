import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

test('patched UUID keeps Xcode identifiers compatible and rejects short buffers', () => {
  const xcodeRequire = createRequire(require.resolve('xcode'));
  const uuid = xcodeRequire('uuid');
  assert.equal(xcodeRequire('uuid/package.json').version, '11.1.1');
  const project = require('xcode').project('unused-test-project.pbxproj');
  project.allUuids = () => [];
  const identifiers = new Set(Array.from({ length: 100 }, () => project.generateUuid()));
  assert.equal(identifiers.size, 100);
  for (const id of identifiers) assert.match(id, /^[0-9A-F]{24}$/);
  assert.throws(() => uuid.v5('test', uuid.v5.DNS, new Uint8Array(8), 4), RangeError);
});
