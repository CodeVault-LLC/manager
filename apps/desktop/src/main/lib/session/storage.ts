/**
 * SessionStorage class provides a singleton instance for managing session storage.
 * It allows setting, getting, removing items, and clearing the storage.
 */
export class SessionStorage {
  private static instance: SessionStorage
  private storage: Map<string, any>
  private timeToLive: Map<string, number>
  private expirationTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.storage = new Map()
    this.timeToLive = new Map()
    this.startExpirationCheck()
  }

  static getInstance(): SessionStorage {
    if (!SessionStorage.instance) {
      SessionStorage.instance = new SessionStorage()
    }
    return SessionStorage.instance
  }

  setItem(key: string, value: any, ttl: number = 0): void {
    this.storage.set(key, value)

    // Only set TTL if greater than 0
    if (ttl > 0) {
      this.timeToLive.set(key, Date.now() + ttl * 1000)
    } else {
      // Remove any existing TTL for this key
      this.timeToLive.delete(key)
    }
  }

  getItem<T>(key: string): T | undefined {
    // Check if the item has expired before returning
    if (this.hasExpired(key)) {
      this.removeItem(key)
      return undefined
    }
    return this.storage.get(key)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
    this.timeToLive.delete(key)
  }

  clear(): void {
    this.storage.clear()
    this.timeToLive.clear()
  }

  /**
   * Checks if an item has expired
   */
  private hasExpired(key: string): boolean {
    const expiry = this.timeToLive.get(key)
    if (!expiry) return false
    return Date.now() > expiry
  }

  /**
   * Starts the expiration check timer
   */
  private startExpirationCheck(): void {
    // Check for expired items every 30 seconds
    this.expirationTimer = setInterval(() => this.removeExpiredItems(), 30000)
  }

  /**
   * Removes all expired items from storage
   */
  private removeExpiredItems(): void {
    const now = Date.now()
    this.timeToLive.forEach((expiry, key) => {
      if (now > expiry) {
        this.removeItem(key)
      }
    })
  }

  /**
   * Cleans up resources when the instance is no longer needed
   */
  dispose(): void {
    if (this.expirationTimer) {
      clearInterval(this.expirationTimer)
      this.expirationTimer = null
    }
  }
}
