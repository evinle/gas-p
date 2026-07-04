import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { join } from 'path';
import type { StubTarget } from './runGenerator.js';

const SRC_ROOT = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

function resolveTypesFile(specifier: string): string {
  return require.resolve(specifier);
}

export const stubTargets: StubTarget[] = [
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.cache.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Cache.CacheService',
    outputName: 'CacheService',
    existingShimFile: join(SRC_ROOT, 'shims/CacheService.ts'),
  },
  {
    typesFile: resolveTypesFile('@types/google-apps-script/google-apps-script.cache.d.ts'),
    qualifiedInterfaceName: 'GoogleAppsScript.Cache.Cache',
    outputName: 'Cache',
    existingShimFile: join(SRC_ROOT, 'shims/CacheService.ts'),
  },
];
