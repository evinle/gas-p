import { describe, it, expect } from 'vitest';
import { generateStubSource } from '../generator/stubSource.js';

describe('generateStubSource', () => {
  it('emits a GasPNotImplementedError stub for every method not already implemented', () => {
    const source = generateStubSource('CacheService', ['getDocumentCache', 'getScriptCache', 'getUserCache'], new Set(['getScriptCache']));

    expect(source).toContain("throw new GasPNotImplementedError('CacheService', 'getDocumentCache')");
    expect(source).toContain("throw new GasPNotImplementedError('CacheService', 'getUserCache')");
    expect(source).not.toContain("'getScriptCache'");
  });

  it('is deterministic: identical inputs produce byte-identical output', () => {
    const args = ['CacheService', ['getDocumentCache', 'getScriptCache', 'getUserCache'], new Set(['getScriptCache'])] as const;

    expect(generateStubSource(...args)).toBe(generateStubSource(...args));
  });

  it('emits no stub entries when every method is already implemented', () => {
    const source = generateStubSource('CacheService', ['getScriptCache'], new Set(['getScriptCache']));

    expect(source).not.toContain('GasPNotImplementedError(');
  });
});
