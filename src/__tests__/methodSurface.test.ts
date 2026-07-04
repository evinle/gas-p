import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { extractMethodSurface } from '../generator/methodSurface.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURE = join(__dirname, '__fixtures__/generator/sample.d.ts');

describe('extractMethodSurface', () => {
  it('lists every method declared on the named interface', () => {
    const methods = extractMethodSurface(FIXTURE, 'GoogleAppsScript.Cache.CacheService');

    expect(methods).toEqual(['getDocumentCache', 'getScriptCache', 'getUserCache']);
  });

  it('collapses overloaded method signatures into a single entry', () => {
    const methods = extractMethodSurface(FIXTURE, 'GoogleAppsScript.Cache.Cache');

    expect(methods).toEqual(['get', 'put', 'remove']);
  });
});
