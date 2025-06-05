import path from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator'
import { app } from 'electron'

import * as schema from './models/schema'

const STORAGE_FILE = path.join(app.getPath('userData'), 'storage.sql')

const client = createClient({ url: `file:${STORAGE_FILE}` })
export const db = drizzle(client, { schema })

export const runMigrations = async () => {
  await migrate(db, {
    migrationsFolder: path.join(__dirname, '../../migrations')
  })
}
