// Transpile src/lib TypeScript modules (pure ones only) into a temp folder so
// node:test can import them with their relative imports intact.
import ts from 'typescript';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'g2m-lib-'));
const done = new Set();
function emit(name) {
  if (done.has(name)) return;
  done.add(name);
  const source = fs.readFileSync(path.resolve('src/lib', `${name}.ts`), 'utf8');
  let code = ts.transpile(source, { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 });
  code = code.replace(/from '\.\/([\w-]+)'/g, (_, dep) => {
    emit(dep);
    return `from './${dep}.mjs'`;
  });
  fs.writeFileSync(path.join(out, `${name}.mjs`), code);
}
export async function load(name) {
  emit(name);
  return import(pathToFileURL(path.join(out, `${name}.mjs`)).href);
}
export const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
