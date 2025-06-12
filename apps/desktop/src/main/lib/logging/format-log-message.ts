import { formatError } from './format-error'

export function formatLogMessage(message: string, errorOrObj?: unknown) {
  if (errorOrObj instanceof Error) {
    return formatError(errorOrObj, message)
  }

  // If it's an object (not null), pretty print it
  if (errorOrObj && typeof errorOrObj === 'object') {
    return `${message}\n${JSON.stringify(errorOrObj, null, 2)}`
  }

  return message
}
