import { describe, it, expect } from 'vitest';
import { findImplementedMethods } from '../generator/implementedMethods.js';

describe('findImplementedMethods', () => {
  it('excludes methods whose body throws GasPNotImplementedError', () => {
    const source = `
      class CacheService {
        getScriptCache() {
          return scriptCache;
        }
        getUserCache(): never {
          throw new GasPNotImplementedError('CacheService', 'getUserCache');
        }
      }
    `;

    expect(findImplementedMethods(source, 'CacheService')).toEqual(new Set(['getScriptCache']));
  });

  it('scopes to a named class, ignoring a same-named method on another class in the same file', () => {
    const source = `
      class Calendar {
        getId(): string {
          return 'real';
        }
      }
      class CalendarEvent {
        getId(): never {
          throw new GasPNotImplementedError('CalendarEvent', 'getId');
        }
      }
    `;

    expect(findImplementedMethods(source, 'Calendar')).toEqual(new Set(['getId']));
    expect(findImplementedMethods(source, 'CalendarEvent')).toEqual(new Set());
  });

  it('throws when the named class cannot be found in the source', () => {
    const source = `class SomethingElse {}`;

    expect(() => findImplementedMethods(source, 'CacheService')).toThrow(/could not locate class "CacheService"/);
  });
});
