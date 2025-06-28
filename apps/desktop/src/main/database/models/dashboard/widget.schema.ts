import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey().notNull(),
  type: text('type').notNull(),
  layout: text('layout', { mode: 'json' })
    .$type<Record<string, { x: number; y: number; w: number; h: number }>>()
    .notNull(),
  static: integer({ mode: 'boolean' }).notNull().default(false),
  settings: text('settings', { mode: 'json' })
    .$type<Record<string, any>>()
    .default({}),
  active: integer({ mode: 'boolean' }).notNull().default(true)
})
