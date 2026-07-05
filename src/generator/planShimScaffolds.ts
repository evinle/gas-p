import type { StubTarget } from './runGenerator.js';
import { generateShimScaffoldSource } from './shimScaffoldSource.js';

// Only a target with a known existingShimFile path can be scaffolded — that
// path is where the hand-written class file belongs. A target still missing
// one hasn't been told where its shim lives yet, so there's nothing to write.
export function planShimScaffolds(
  targets: readonly StubTarget[],
  readShimSource: (path: string) => string | undefined
): Map<string, string> {
  const plan = new Map<string, string>();

  for (const target of targets) {
    if (!target.existingShimFile) continue;
    if (plan.has(target.existingShimFile)) continue;
    if (readShimSource(target.existingShimFile) !== undefined) continue;

    plan.set(target.existingShimFile, generateShimScaffoldSource(target.outputName));
  }

  return plan;
}
