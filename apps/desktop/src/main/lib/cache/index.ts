const cache = new Map()

export const getCache = <T>(key: string): T | undefined => {
  return cache.get(key) as T | undefined
}

export const setCache = <T>(key: string, value: T, ttl: number): void => {
  cache.set(key, value)

  setTimeout(() => {
    cache.delete(key)
  }, ttl)
}

export const clearCache = (): void => {
  cache.clear()
}

export const removeCache = (key: string): void => {
  cache.delete(key)
}

export const hasCache = (key: string): boolean => {
  return cache.has(key)
}
