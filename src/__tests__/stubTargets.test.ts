import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { stubTargets } from '../generator/stubTargets.js';

describe('stubTargets', () => {
  it('resolves every configured types file to a real path on disk', () => {
    expect(stubTargets.length).toBeGreaterThan(0);
    for (const target of stubTargets) {
      expect(existsSync(target.typesFile)).toBe(true);
    }
  });
});
