import { describe, it, expect, vi } from 'vitest';
import { run } from '../index.js';

vi.mock('../auth.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../auth.js')>();
  return { ...actual, readStoredCredentials: () => null };
});

function hasMethod(x: unknown, key: string): x is Record<string, unknown> {
  if (typeof x !== 'object' || x === null) return false;
  if (!(key in x)) return false;
  return typeof Reflect.get(x, key) === 'function';
}

describe('run()', () => {
  it('injects UrlFetchApp into global scope before calling fn', async () => {
    let injected: unknown;
    await run(() => { injected = Reflect.get(globalThis, 'UrlFetchApp'); });
    expect(hasMethod(injected, 'fetch')).toBe(true);
  });

  it('injects Logger into global scope before calling fn', async () => {
    let injected: unknown;
    await run(() => { injected = Reflect.get(globalThis, 'Logger'); });
    expect(hasMethod(injected, 'log')).toBe(true);
  });

  it('injects CalendarApp into global scope before calling fn', async () => {
    let injected: unknown;
    await run(() => { injected = Reflect.get(globalThis, 'CalendarApp'); });
    expect(hasMethod(injected, 'getCalendarById')).toBe(true);
  });
});
