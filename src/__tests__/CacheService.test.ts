import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheService } from '../shims/CacheService.js';
import { GasPNotImplementedError } from '../errors.js';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-04T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CacheService.getScriptCache()', () => {
  it('returns null for a key that was never put', () => {
    const cache = CacheService.getScriptCache();
    expect(cache.get('never-set')).toBeNull();
  });

  it('returns a value that was put, via a separate getScriptCache() call', () => {
    CacheService.getScriptCache().put('key1', 'value1');
    expect(CacheService.getScriptCache().get('key1')).toBe('value1');
  });

  it('expires a value after the given expirationInSeconds', () => {
    CacheService.getScriptCache().put('key2', 'value2', 10);
    vi.advanceTimersByTime(9_000);
    expect(CacheService.getScriptCache().get('key2')).toBe('value2');
    vi.advanceTimersByTime(2_000);
    expect(CacheService.getScriptCache().get('key2')).toBeNull();
  });
});

describe('CacheService unimplemented methods', () => {
  it('getUserCache throws GasPNotImplementedError', () => {
    expect(() => CacheService.getUserCache()).toThrow(GasPNotImplementedError);
  });

  it('getDocumentCache throws GasPNotImplementedError', () => {
    expect(() => CacheService.getDocumentCache()).toThrow(GasPNotImplementedError);
  });
});

describe('Cache unimplemented methods', () => {
  it('getAll throws GasPNotImplementedError', () => {
    const cache = CacheService.getScriptCache();
    expect(() => cache.getAll(['key1'])).toThrow(GasPNotImplementedError);
  });

  it('putAll throws GasPNotImplementedError', () => {
    const cache = CacheService.getScriptCache();
    expect(() => cache.putAll({ key1: 'value1' })).toThrow(GasPNotImplementedError);
  });

  it('removeAll throws GasPNotImplementedError', () => {
    const cache = CacheService.getScriptCache();
    expect(() => cache.removeAll(['key1'])).toThrow(GasPNotImplementedError);
  });
});

describe('Cache.remove()', () => {
  it('removes a previously put value', () => {
    const cache = CacheService.getScriptCache();
    cache.put('key3', 'value3');
    cache.remove('key3');
    expect(cache.get('key3')).toBeNull();
  });
});
