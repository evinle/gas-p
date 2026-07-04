import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { runGenerator, type StubTarget } from '../generator/runGenerator.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURE = join(__dirname, '__fixtures__/generator/sample.d.ts');

describe('runGenerator', () => {
  it('produces one generated source per target, skipping methods found implemented in the existing shim', () => {
    const targets: StubTarget[] = [
      {
        typesFile: FIXTURE,
        qualifiedInterfaceName: 'GoogleAppsScript.Cache.CacheService',
        outputName: 'CacheService',
        existingShimFile: '/fake/CacheService.ts',
      },
    ];

    const existingSources = new Map([
      [
        '/fake/CacheService.ts',
        `export const CacheService = { getScriptCache() { return scriptCache; } };`,
      ],
    ]);

    const result = runGenerator(targets, (path) => existingSources.get(path));

    const output = result.get('CacheService');
    expect(output).toContain("throw new GasPNotImplementedError('CacheService', 'getDocumentCache')");
    expect(output).toContain("throw new GasPNotImplementedError('CacheService', 'getUserCache')");
    expect(output).not.toContain("'getScriptCache'");
  });

  it('treats a target with no existing shim file as fully unimplemented', () => {
    const targets: StubTarget[] = [
      {
        typesFile: FIXTURE,
        qualifiedInterfaceName: 'GoogleAppsScript.Cache.CacheService',
        outputName: 'CacheService',
      },
    ];

    const output = runGenerator(targets, () => undefined).get('CacheService');

    expect(output).toContain("'getScriptCache'");
    expect(output).toContain("'getDocumentCache'");
    expect(output).toContain("'getUserCache'");
  });

  it('disambiguates same-named methods across sibling containers via implementationScope', () => {
    const targets: StubTarget[] = [
      {
        typesFile: FIXTURE,
        qualifiedInterfaceName: 'GoogleAppsScript.Cache.CacheService',
        outputName: 'RealOne',
        existingShimFile: '/fake/shim.ts',
        implementationScope: 'RealOne',
      },
      {
        typesFile: FIXTURE,
        qualifiedInterfaceName: 'GoogleAppsScript.Cache.CacheService',
        outputName: 'StubOne',
        existingShimFile: '/fake/shim.ts',
        implementationScope: 'StubOne',
      },
    ];

    const source = `
      export const RealOne = {
        getScriptCache() {
          return 'a real implementation';
        },
      };
      export const StubOne = {
        getScriptCache(): never {
          throw new GasPNotImplementedError('StubOne', 'getScriptCache');
        },
      };
    `;

    const result = runGenerator(targets, () => source);

    expect(result.get('RealOne')).not.toContain("'getScriptCache'");
    expect(result.get('StubOne')).toContain("'getScriptCache'");
  });
});
