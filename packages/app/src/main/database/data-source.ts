import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './models/schema'
import path from 'node:path'
import { app } from 'electron'

const STORAGE_FILE = path.join(app.getPath('userData'), 'storage.sql')

const storageDatabase = new Database(STORAGE_FILE)
export const db = drizzle({ client: storageDatabase, schema })

export const runMigrations = async () => {
  migrate(db, {
    migrationsFolder: path.join(__dirname, '../../migrations')
  })
}
