/**
 * SessionStorage class provides a singleton instance for managing session storage.
 * It allows setting, getting, removing items, and clearing the storage.
 */
export class SessionStorage {
  private static instance: SessionStorage
  private storage: Map<string, any>

  private constructor() {
    this.storage = new Map()
  }

  static getInstance(): SessionStorage {
    if (!SessionStorage.instance) {
      SessionStorage.instance = new SessionStorage()
    }
    return SessionStorage.instance
  }

  setItem(key: string, value: any): void {
    this.storage.set(key, value)
  }

  getItem<T>(key: string): T | undefined {
    return this.storage.get(key)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}
