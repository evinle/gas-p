import { describe, it, expect } from 'vitest';
import { run } from '../index.js';

describe('run', () => {
  it('calls the provided function', async () => {
    let called = false;
    await run(() => { called = true; });
    expect(called).toBe(true);
  });
});
