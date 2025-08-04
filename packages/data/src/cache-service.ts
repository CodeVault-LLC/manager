export class CacheService {
  private static instance: CacheService;
  private cache = new Map();

  constructor() {
    if (CacheService.instance) {
      throw new Error(
        "CacheService is a singleton and cannot be instantiated multiple times."
      );
    }
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      throw new Error("CacheService is not initialized");
    }
    return CacheService.instance;
  }

  getCache = <T>(key: string): T | undefined => {
    return this.cache.get(key) as T | undefined;
  };

  setCache = <T>(key: string, value: T, ttl: number): void => {
    this.cache.set(key, value);

    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  };

  clearCache = (): void => {
    this.cache.clear();
  };

  removeCache = (key: string): void => {
    this.cache.delete(key);
  };

  hasCache = (key: string): boolean => {
    return this.cache.has(key);
  };
}
