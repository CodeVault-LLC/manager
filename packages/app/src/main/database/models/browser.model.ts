import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const browsers = sqliteTable('browsers', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  browserId: text('browser_id').notNull(),
  path: text('path').notNull(),
  synced: integer({ mode: 'boolean' }),

  syncedAt: integer({ mode: 'timestamp' }).notNull().defaultNow(),
  createdAt: integer({ mode: 'timestamp' }).notNull().defaultNow()
})

export type Browser = typeof browsers.$inferSelect
