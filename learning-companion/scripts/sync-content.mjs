import fs from 'node:fs';
import path from 'node:path';
const out = path.resolve('src/content');
fs.mkdirSync(out, { recursive: true });
for (const name of ['curriculum', 'first-28-days', 'resources', 'courses', 'books', 'papers', 'video-companions', 'study-guides']) {
  fs.copyFileSync(path.resolve('../data', `${name}.json`), path.join(out, `${name}.json`));
}
console.log('Bundled eight curriculum files.');
