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

describe('findImplementedMethods scoped to a container name', () => {
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

  it('scopes to the object literal returned by a create<Scope> factory function', () => {
    const source = `
      function createCalendarApp() {
        return {
          getDefaultCalendar() {
            return realCalendar;
          },
          getCalendarsByName(): never {
            throw new GasPNotImplementedError('CalendarApp', 'getCalendarsByName');
          },
        };
      }
    `;

    expect(findImplementedMethods(source, 'CalendarApp')).toEqual(new Set(['getDefaultCalendar']));
  });

  it('scopes to an object literal assigned to a matching variable name, resolving shorthand properties to their function declarations', () => {
    const source = `
      function get(key: string): string | null {
        return store.get(key) ?? null;
      }
      function getAll(_keys: string[]): never {
        throw new GasPNotImplementedError('Cache', 'getAll');
      }
      const scriptCache = { get, getAll };
    `;

    expect(findImplementedMethods(source, 'scriptCache')).toEqual(new Set(['get']));
  });
});
