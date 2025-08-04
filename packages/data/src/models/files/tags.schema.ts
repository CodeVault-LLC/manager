import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#0047ab')
})
