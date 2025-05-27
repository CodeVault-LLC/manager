import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable('notes', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
})

export type Note = typeof notes.$inferSelect
