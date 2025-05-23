import { EventEmitter } from 'events'
import fs from 'fs/promises'
import path from 'node:path'

import { app } from 'electron'

import { api } from './services/api.service'

const STORAGE_FILE = path.join(app.getPath('userData'), 'config.json')

// Create an event emitter to notify about storage changes
const storageEvents = new EventEmitter()

export const ConfStorage = {
  async validateExistence() {
    try {
      await fs.access(STORAGE_FILE)

      const content = await fs.readFile(STORAGE_FILE, 'utf8')
      const data = JSON.parse(content)

      api.defaults.headers.Authorization = `Bearer ${data.userToken}`
    } catch {
      await fs.writeFile(
        STORAGE_FILE,
        JSON.stringify({ userToken: '' }, null, 2),
        'utf8'
      )
    }
  },

  async readData(): Promise<Record<string, any>> {
    try {
      const content = await fs.readFile(STORAGE_FILE, 'utf8')
      return content ? JSON.parse(content) : {}
    } catch (error) {
      console.error('Error reading config file:', error)
      return {}
    }
  },

  async writeData(data: Record<string, any>) {
    try {
      await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8')
      storageEvents.emit('storage-updated', data)
    } catch (error) {
      console.error('Error writing to config file:', error)
    }
  },

  async setSecureData(key: string, value: any) {
    await this.validateExistence()

    const data = await this.readData()
    data[key] = value
    await this.writeData(data)

    if (key === 'userToken') {
      api.defaults.headers.Authorization = `Bearer ${value}`
    }

    storageEvents.emit(`storage-key-changed:${key}`, value)

    return value
  },

  async getSecureData(key: string) {
    await this.validateExistence()

    const data = await this.readData()
    return data[key] ?? null
  },

  async deleteSecureData(key: string) {
    await this.validateExistence()

    const data = await this.readData()
    const oldValue = data[key]
    delete data[key]
    await this.writeData(data)

    // Emit a specific event for this deletion
    storageEvents.emit(`storage-key-deleted:${key}`, oldValue)

    if (key === 'userToken') {
      api.defaults.headers.Authorization = ''
    }

    return true
  },

  // Add methods to subscribe to storage changes
  onUpdate(callback: (data: Record<string, any>) => void) {
    storageEvents.on('storage-updated', callback)

    return () => storageEvents.off('storage-updated', callback)
  },

  onKeyChange(key: string, callback: (value: any) => void) {
    storageEvents.on(`storage-key-changed:${key}`, callback)

    return () => storageEvents.off(`storage-key-changed:${key}`, callback)
  },

  onKeyDelete(key: string, callback: (oldValue: any) => void) {
    storageEvents.on(`storage-key-deleted:${key}`, callback)

    return () => storageEvents.off(`storage-key-deleted:${key}`, callback)
  }
}

// Add IPC handlers for storage
export function setupStorageIPC() {
  storageEvents.on('storage-updated', async data => {
    const windows = require('electron').BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (win.webContents) {
        win.webContents.send('storage-updated', data)
      }
    }
  })
}
