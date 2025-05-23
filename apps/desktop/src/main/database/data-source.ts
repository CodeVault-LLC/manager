import path from 'node:path'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'

import * as schema from './models/schema'

const STORAGE_FILE = path.join(app.getPath('userData'), 'storage.sql')

const storageDatabase = new Database(STORAGE_FILE)
export const db = drizzle({ client: storageDatabase, schema })

export const runMigrations = async () => {
  migrate(db, {
    migrationsFolder: path.join(__dirname, '../../migrations')
  })
}
