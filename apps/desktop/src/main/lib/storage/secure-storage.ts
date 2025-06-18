import keytar from 'keytar'

const SERVICE = 'Manager Desktop Secure Storage'

export const SecureStorage = {
  async set(key: string, value: string) {
    return keytar.setPassword(SERVICE, key, value)
  },

  async get(key: string): Promise<string | null> {
    return keytar.getPassword(SERVICE, key)
  },

  async delete(key: string) {
    return keytar.deletePassword(SERVICE, key)
  }
}
