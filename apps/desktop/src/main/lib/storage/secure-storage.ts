import keytar from 'keytar'

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
  }
}
