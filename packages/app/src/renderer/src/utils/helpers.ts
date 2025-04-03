import { API_BASE_URL } from '@shared/constants'
import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(...inputs))

/**
 * @description combine the file path with the base URL
 * @param {string} path
 * @returns {string} final URL with the base URL
 */
export const getFileURL = (path: string): string | undefined => {
  if (!path) return undefined
  const isValidURL = path.startsWith('http')
  if (isValidURL) return path
  return `${API_BASE_URL}${path}`
}
