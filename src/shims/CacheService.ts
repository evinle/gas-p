import { CacheStubs } from './generated/Cache.stubs.js';
import { CacheServiceStubs } from './generated/CacheService.stubs.js';

const DEFAULT_EXPIRATION_SECONDS = 600;

interface CacheEntry {
  value: string;
  expiresAt: number;
}

class Cache extends CacheStubs {
  private store = new Map<string, CacheEntry>();

  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  put(key: string, value: string, expirationInSeconds: number = DEFAULT_EXPIRATION_SECONDS): void {
    this.store.set(key, { value, expiresAt: Date.now() + expirationInSeconds * 1000 });
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}

const scriptCache = new Cache();

class CacheService extends CacheServiceStubs {
  getScriptCache() {
    return scriptCache;
  }
}

const instance = new CacheService();
export { instance as CacheService };
