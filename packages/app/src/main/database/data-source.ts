import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

const mangaFile = new Database('storage.db')

export const db = drizzle(mangaFile, {})
