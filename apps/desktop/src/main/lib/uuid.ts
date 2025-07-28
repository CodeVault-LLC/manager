/**
 * Generates a random UUID (Universally Unique Identifier).
 * The UUID is in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx, where:
 * - x is any hexadecimal digit (0-9, a-f)
 * - y is one of 8, 9, A, or B (to comply with the UUID version 4 specification).
 * @returns {string} A randomly generated UUID in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
