import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { files } from './files.schema'
import { tags } from './tags.schema'
import { relations } from 'drizzle-orm'

export const filesTags = sqliteTable('files_tags', {
  id: text('id').primaryKey().notNull(),
  file: text('file_id')
    .notNull()
    .references(() => files.id),
  tag: text('tag_id')
    .notNull()
    .references(() => tags.id)
})

export const filesTagsRelations = relations(filesTags, ({ one }) => ({
  file: one(files, {
    fields: [filesTags.file],
    references: [files.id]
  }),
  tag: one(tags, {
    fields: [filesTags.tag],
    references: [tags.id]
  })
}))
