// Like load.mjs, but for any pure module under src/ (e.g. src/assistant/*) whose
// relative imports may cross folders ('../lib/assess'). Type-only imports vanish
// on transpile; modules that import React/Expo must not be loaded here.
import ts from 'typescript';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve('src');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'g2m-src-'));
const done = new Set();
function emit(rel) {
  if (done.has(rel)) return;
  done.add(rel);
  const source = fs.readFileSync(path.join(root, `${rel}.ts`), 'utf8');
  let code = ts.transpile(source, { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 });
  code = code.replace(/from '(\.\.?\/[\w/.-]+)'/g, (_, dep) => {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), dep));
    emit(target);
    const fromDir = path.posix.dirname(rel);
    let spec = path.posix.relative(fromDir, target) + '.mjs';
    if (!spec.startsWith('.')) spec = `./${spec}`;
    return `from '${spec}'`;
  });
  const file = path.join(out, `${rel}.mjs`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, code);
}
/** load('assistant/sse') → module exports. */
export async function loadSrc(rel) {
  emit(rel);
  return import(pathToFileURL(path.join(out, `${rel}.mjs`)).href);
}
