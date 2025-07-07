import { useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* empty */
    }
  }

  return [storedValue, setValue]
}
