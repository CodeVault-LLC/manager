import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { filesCategories } from './files-categories.schema'
import { relations } from 'drizzle-orm'

export const files = sqliteTable('files', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  mime: text('mime').notNull(),
  size: integer('size').notNull(),

  path: text('path').notNull(),
  thumbnail: text('thumbnail'),
  length: integer('length').default(0),
  dimensions: text('dimensions'),
  categoryId: text('category_id').references(() => filesCategories.id),

  createdAt: integer({ mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer({ mode: 'timestamp' }).notNull().defaultNow()
})

export const filesRelations = relations(files, ({ one }) => ({
  category: one(filesCategories, {
    fields: [files.categoryId],
    references: [filesCategories.id]
  })
}))
