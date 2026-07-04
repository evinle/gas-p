import { CacheStubs } from './generated/Cache.stubs.js';
import { CacheServiceStubs } from './generated/CacheService.stubs.js';

const DEFAULT_EXPIRATION_SECONDS = 600;

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

function get(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function put(key: string, value: string, expirationInSeconds: number = DEFAULT_EXPIRATION_SECONDS): void {
  store.set(key, { value, expiresAt: Date.now() + expirationInSeconds * 1000 });
}

function remove(key: string): void {
  store.delete(key);
}

const scriptCache = { ...CacheStubs, get, put, remove };

export const CacheService = {
  ...CacheServiceStubs,
  getScriptCache() {
    return scriptCache;
  },
};
