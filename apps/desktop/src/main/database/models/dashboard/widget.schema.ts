import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey().notNull(),
  type: text('type').notNull(),
  x: integer('x').notNull(),
  y: integer('y').notNull(),
  w: integer('w').notNull(),
  h: integer('h').notNull(),
  static: integer({ mode: 'boolean' }),
  settings: text('settings', { mode: 'json' })
    .$type<Record<string, any>>()
    .default({}),
  active: integer({ mode: 'boolean' }).notNull().default(true)
})
