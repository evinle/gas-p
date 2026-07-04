import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { runGenerator } from './runGenerator.js';
import { stubTargets } from './stubTargets.js';

const OUTPUT_DIR = join(fileURLToPath(new URL('../', import.meta.url)), 'shims/generated');

function readShimSource(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, 'utf-8') : undefined;
}

const generated = runGenerator(stubTargets, readShimSource);
const checkMode = process.argv.includes('--check');
let stale = false;

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const [outputName, source] of generated) {
  const outputPath = join(OUTPUT_DIR, `${outputName}.stubs.ts`);
  const current = existsSync(outputPath) ? readFileSync(outputPath, 'utf-8') : undefined;

  if (current === source) continue;

  if (checkMode) {
    stale = true;
    console.error(`Stale stub file: ${outputPath}`);
  } else {
    writeFileSync(outputPath, source);
    console.log(`Wrote ${outputPath}`);
  }
}

if (checkMode && stale) {
  console.error('Generated stubs are out of date. Run `npm run generate:stubs` to update.');
  process.exit(1);
}
