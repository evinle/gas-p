import { describe, it, expect } from 'vitest';
import { Utilities } from '../shims/Utilities.js';
import { GasPNotImplementedError } from '../errors.js';

describe('Utilities.base64Decode()', () => {
  it('decodes a base64 string into the original bytes', () => {
    const encoded = Buffer.from('hello world', 'utf-8').toString('base64');
    const decoded = Utilities.base64Decode(encoded);
    expect(Buffer.from(decoded).toString('utf-8')).toBe('hello world');
  });
});

describe('Utilities.formatDate()', () => {
  it('formats a UTC instant into the given IANA timezone using yyyy-MM-dd tokens', () => {
    const date = new Date('2026-07-04T02:30:00Z');
    expect(Utilities.formatDate(date, 'America/New_York', 'yyyy-MM-dd')).toBe('2026-07-03');
    expect(Utilities.formatDate(date, 'Australia/Sydney', 'yyyy-MM-dd')).toBe('2026-07-04');
  });

  it('formats time-of-day tokens correctly', () => {
    const date = new Date('2026-07-04T14:05:09Z');
    expect(Utilities.formatDate(date, 'UTC', 'HH:mm:ss')).toBe('14:05:09');
  });
});

describe('Utilities unimplemented methods', () => {
  it('base64Encode throws GasPNotImplementedError', () => {
    expect(() => Utilities.base64Encode('hello')).toThrow(GasPNotImplementedError);
  });

  it('computeDigest throws GasPNotImplementedError', () => {
    expect(() => Utilities.computeDigest()).toThrow(GasPNotImplementedError);
  });

  it('getUuid throws GasPNotImplementedError', () => {
    expect(() => Utilities.getUuid()).toThrow(GasPNotImplementedError);
  });
});
