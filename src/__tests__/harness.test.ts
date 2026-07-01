import { describe, it, expect } from 'vitest';
import { run } from '../index.js';

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
});
