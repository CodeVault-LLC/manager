import { EventEmitter } from 'events'
import fs from 'fs/promises'
import path from 'node:path'
import { app } from 'electron'
import { api } from './services/api.service'
import { SecureStorage } from './lib/storage/secure-storage'

const STORAGE_FILE = path.join(app.getPath('userData'), 'config.json')
const storageEvents = new EventEmitter()

const defaultConfig = {
  theme: 'light'
}

export const ConfStorage = {
  async init() {
    try {
      await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true })
      await fs.writeFile(
        STORAGE_FILE,
        JSON.stringify(defaultConfig, null, 2),
        'utf8'
      )
    } catch (err) {
      log.error('Error initializing config storage:', err)
    }

    const userToken = await SecureStorage.get('userToken')
    if (userToken) {
      api.defaults.headers.Authorization = `Bearer ${userToken}`
    }
  },

  async readConfig(): Promise<Record<string, any>> {
    try {
      const content = await fs.readFile(STORAGE_FILE, 'utf8')
      return content ? JSON.parse(content) : { ...defaultConfig }
    } catch {
      return { ...defaultConfig }
    }
  },

  async writeConfig(data: Record<string, any>) {
    try {
      await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8')
      storageEvents.emit('storage-updated', data)
    } catch (err) {
      log.error('Error writing config file:', err)
    }
  },

  async get(key: string): Promise<any> {
    const config = await this.readConfig()
    return config[key] ?? null
  },

  async set(key: string, value: any) {
    const config = await this.readConfig()
    config[key] = value
    await this.writeConfig(config)
    storageEvents.emit(`config-key-changed:${key}`, value)
  },

  async delete(key: string) {
    const config = await this.readConfig()
    delete config[key]
    await this.writeConfig(config)
    storageEvents.emit(`config-key-deleted:${key}`)
  },

  async getSecret(key: string) {
    return SecureStorage.get(key)
  },

  async setSecret(key: string, value: string) {
    await SecureStorage.set(key, value)

    if (key === 'userToken') {
      api.defaults.headers.Authorization = `Bearer ${value}`
    }

    storageEvents.emit(`secret-key-changed:${key}`, value)
  },

  async deleteSecret(key: string) {
    await SecureStorage.delete(key)

    if (key === 'userToken') {
      api.defaults.headers.Authorization = ''
    }

    storageEvents.emit(`secret-key-deleted:${key}`)
  },

  onUpdate(callback: (data: Record<string, any>) => void) {
    storageEvents.on('storage-updated', callback)
    return () => storageEvents.off('storage-updated', callback)
  },

  onKeyChange(key: string, callback: (value: any) => void) {
    storageEvents.on(`config-key-changed:${key}`, callback)
    return () => storageEvents.off(`config-key-changed:${key}`, callback)
  }
}
