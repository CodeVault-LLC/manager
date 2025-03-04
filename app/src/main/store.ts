import { app } from 'electron'
import path from 'node:path'
import fs from 'fs/promises'

const STORAGE_FILE = path.join(app.getPath('userData'), 'config.json')

export const ConfStorage = {
  async validateExistence() {
    try {
      await fs.access(STORAGE_FILE)
    } catch {
      console.log('Config file not found, creating new one...')
      await fs.writeFile(STORAGE_FILE, JSON.stringify({ userToken: '' }, null, 2), 'utf8')
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
    } catch (error) {
      console.error('Error writing to config file:', error)
    }
  },

  async setSecureData(key: string, value: any) {
    await this.validateExistence()

    const data = await this.readData()
    data[key] = value
    await this.writeData(data)
  },

  async getSecureData(key: string) {
    await this.validateExistence()

    const data = await this.readData()
    console.log(data)
    console.log(data[key])

    return data[key] ?? null
  },

  async deleteSecureData(key: string) {
    await this.validateExistence()

    const data = await this.readData()
    delete data[key]
    await this.writeData(data)
  }
}
