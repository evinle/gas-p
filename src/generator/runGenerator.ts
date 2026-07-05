import { extractMethodSurface } from './methodSurface.js';
import { findImplementedMethods } from './implementedMethods.js';
import { generateStubSource, type StubOutputFormat } from './stubSource.js';

export interface StubTarget {
  typesFile: string;
  qualifiedInterfaceName: string;
  outputName: string;
  existingShimFile?: string;
  /** Name of the class/factory/const in existingShimFile whose members represent this interface's implementation. Defaults to outputName. */
  implementationScope?: string;
  /** 'object' (default) emits a plain stub object to spread; 'class' emits an abstract class to extend. */
  outputFormat?: StubOutputFormat;
}

export function runGenerator(
  targets: readonly StubTarget[],
  readShimSource: (path: string) => string | undefined
): Map<string, string> {
  const result = new Map<string, string>();

  for (const target of targets) {
    const methods = extractMethodSurface(target.typesFile, target.qualifiedInterfaceName);
    const existingSource = target.existingShimFile ? readShimSource(target.existingShimFile) : undefined;
    const implemented = existingSource
      ? findImplementedMethods(existingSource, target.implementationScope ?? target.outputName)
      : new Set<string>();
    result.set(target.outputName, generateStubSource(target.outputName, methods, implemented, target.outputFormat));
  }

  return result;
}
