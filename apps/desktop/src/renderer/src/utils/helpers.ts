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

/**
 * @description format the file size to a human-readable format
 * @param {number} size - file size in bytes
 */
export const formatSize = (size: number): string => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * @description format the time to a human-readable format (13.067 - 13s)
 */
export const formatTime = (time: number): string => {
  if (time < 60) return `${time.toFixed()}s`
  if (time < 3600) return `${(time / 60).toFixed(2)}m`
  return `${(time / 3600).toFixed(2)}h`
}
