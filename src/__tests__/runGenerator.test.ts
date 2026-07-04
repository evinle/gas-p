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
});
