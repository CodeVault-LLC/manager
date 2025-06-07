import { relations } from 'drizzle-orm'
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { news } from './news.schema'

type NewsThumbnailResolution = {}

export const newsThumbnail = sqliteTable('news_thumbnail', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  newsId: text('news_id')
    .notNull()
    .references(() => news.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),

  originalUrl: text('original_url').notNull(),
  originalWidth: integer('original_width').notNull(),
  originalHeight: integer('original_height').notNull(),
  caption: text('caption'),

  resolutions: blob('resolutions').$type<NewsThumbnailResolution[]>()
})

export const newsThumbnailRelations = relations(newsThumbnail, ({ one }) => ({
  news: one(news, {
    fields: [newsThumbnail.newsId],
    references: [news.id]
  })
}))

export type NewsThumbnail = typeof newsThumbnail.$inferSelect
