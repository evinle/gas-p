declare namespace GoogleAppsScript {
  namespace Cache {
    interface Cache {
      get(key: string): string | null;
      put(key: string, value: string): void;
      put(key: string, value: string, expirationInSeconds: number): void;
      remove(key: string): void;
    }
    interface CacheService {
      getDocumentCache(): Cache | null;
      getScriptCache(): Cache;
      getUserCache(): Cache;
    }
  }
}
