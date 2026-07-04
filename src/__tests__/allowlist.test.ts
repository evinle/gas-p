import { describe, it, expect } from 'vitest';
import { assertResourceAllowed, GasPResourceNotAllowedError } from '../core/allowlist.js';

describe('assertResourceAllowed()', () => {
  it('does not throw when the ID is in the allowlist for that service', () => {
    expect(() =>
      assertResourceAllowed({ CalendarApp: ['cal123'] }, 'CalendarApp', 'cal123')
    ).not.toThrow();
  });

  it('throws GasPResourceNotAllowedError when the ID is not in the allowlist for that service', () => {
    expect(() =>
      assertResourceAllowed({ CalendarApp: ['cal123'] }, 'CalendarApp', 'other-cal')
    ).toThrow(GasPResourceNotAllowedError);
  });
});
