import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runGenerator } from './runGenerator.js';
import { planShimScaffolds } from './planShimScaffolds.js';
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

// Scaffolds the hand-written shim file for a brand-new service (one with an
// existingShimFile path in stubTargets.ts that doesn't exist on disk yet).
// Never overwrites one that already exists — planShimScaffolds already
// excludes those.
for (const [shimPath, source] of planShimScaffolds(stubTargets, readShimSource)) {
  if (checkMode) {
    stale = true;
    console.error(`Missing shim file: ${shimPath}`);
  } else {
    mkdirSync(dirname(shimPath), { recursive: true });
    writeFileSync(shimPath, source);
    console.log(`Wrote ${shimPath}`);
  }
}

if (checkMode && stale) {
  console.error('Generated stubs are out of date. Run `npm run generate:stubs` to update.');
  process.exit(1);
}
