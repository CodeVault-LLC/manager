import keytar from 'keytar'
import { createHash, randomBytes } from 'node:crypto'

const SERVICE = 'Manager Desktop Secure Storage'

export const SecureStorage = {
  async set(key: string, value: string) {
    return await keytar.setPassword(SERVICE, key, value)
  },

  async get(key: string): Promise<string | null> {
    const existingValue = await keytar.getPassword(SERVICE, key)
    return existingValue
  },

  async delete(key: string) {
    return await keytar.deletePassword(SERVICE, key)
  },

  generateRandomKey(salt: string): string {
    return createHash('sha256').update(salt).digest('base64').substr(0, 32)
  },

  /**
   * Generate a simple key without a requirement
   * Used for things like salt or other non-sensitive data
   * @returns {string} A simple key, 32 characters long
   * @example
   * ```ts
   * const simpleKey = SecureStorage.generateSimpleKey()
   * ```
   *
   * This method generates a simple key that is not cryptographically secure.
   * It is intended for use in scenarios where a non-sensitive key is needed,
   */
  generateSimpleKey(): string {
    return randomBytes(16).toString('hex')
  }
}
