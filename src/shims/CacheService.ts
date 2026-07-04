import { GasPNotImplementedError } from '../errors.js';

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

function getAll(_keys: string[]): never {
  throw new GasPNotImplementedError('Cache', 'getAll');
}

function putAll(_values: Record<string, string>): never {
  throw new GasPNotImplementedError('Cache', 'putAll');
}

function removeAll(_keys: string[]): never {
  throw new GasPNotImplementedError('Cache', 'removeAll');
}

const scriptCache = { get, put, remove, getAll, putAll, removeAll };

export const CacheService = {
  getScriptCache() {
    return scriptCache;
  },
  getUserCache(): never {
    throw new GasPNotImplementedError('CacheService', 'getUserCache');
  },
  getDocumentCache(): never {
    throw new GasPNotImplementedError('CacheService', 'getDocumentCache');
  },
};
