import { describe, it, expect } from 'vitest';
import { findImplementedMethods } from '../generator/implementedMethods.js';

describe('findImplementedMethods', () => {
  it('excludes methods whose body throws GasPNotImplementedError', () => {
    const source = `
      export const CacheService = {
        getScriptCache() {
          return scriptCache;
        },
        getUserCache(): never {
          throw new GasPNotImplementedError('CacheService', 'getUserCache');
        },
      };
    `;

    expect(findImplementedMethods(source)).toEqual(new Set(['getScriptCache']));
  });

  it('recognizes standalone function declarations referenced via object shorthand', () => {
    const source = `
      function get(key: string): string | null {
        return store.get(key) ?? null;
      }

      function getAll(_keys: string[]): never {
        throw new GasPNotImplementedError('Cache', 'getAll');
      }

      const scriptCache = { get, getAll };
    `;

    expect(findImplementedMethods(source)).toEqual(new Set(['get']));
  });
});
