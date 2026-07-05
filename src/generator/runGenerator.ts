import { extractMethodSurface } from './methodSurface.js';
import { findImplementedMethods } from './implementedMethods.js';
import { generateStubSource } from './stubSource.js';

export interface StubTarget {
  typesFile: string;
  qualifiedInterfaceName: string;
  outputName: string;
  existingShimFile?: string;
}

export function runGenerator(
  targets: readonly StubTarget[],
  readShimSource: (path: string) => string | undefined
): Map<string, string> {
  const result = new Map<string, string>();

  for (const target of targets) {
    const methods = extractMethodSurface(target.typesFile, target.qualifiedInterfaceName);
    const existingSource = target.existingShimFile ? readShimSource(target.existingShimFile) : undefined;
    const implemented = existingSource ? findImplementedMethods(existingSource, target.outputName) : new Set<string>();
    result.set(target.outputName, generateStubSource(target.outputName, methods, implemented));
  }

  return result;
}
