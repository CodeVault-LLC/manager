import { app } from 'electron'
import path from 'node:path'
import fs from 'fs/promises'
import crypto from 'node:crypto'

const STORAGE_FILE = path.join(app.getPath('userData'), 'config.json')
const ENCRYPTION_KEY = crypto.createHash('sha256').update('your-secure-key').digest()

export const ConfStorage = {
  async encryptData(data: object) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return JSON.stringify({ iv: iv.toString('hex'), encrypted })
  },

  async decryptData() {
    try {
      const content = await fs.readFile(STORAGE_FILE, 'utf8')
      const { iv, encrypted } = JSON.parse(content)
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        ENCRYPTION_KEY,
        Buffer.from(iv, 'hex')
      )
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return JSON.parse(decrypted)
    } catch {
      return {}
    }
  },

  async setSecureData(key: string, value: string) {
    const data = await ConfStorage.decryptData()
    data[key] = value
    await fs.writeFile(STORAGE_FILE, await ConfStorage.encryptData(data), 'utf8')
  },

  async getSecureData(key: string) {
    const data = await ConfStorage.decryptData()
    return data[key] || null
  },

  async deleteSecureData(key: string) {
    const data = await ConfStorage.decryptData()
    delete data[key]
    await fs.writeFile(STORAGE_FILE, await ConfStorage.encryptData(data), 'utf8')
  }
}
