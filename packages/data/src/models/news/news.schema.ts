import { relations } from 'drizzle-orm'
import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { newsProvider } from './news-provider.schema'
import { newsThumbnail } from './news-thumbnail.schema'

export const news = sqliteTable('news', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  newsId: text('news_id').notNull().unique(),

  title: text('title').notNull(),
  description: text('description'),
  summary: text('summary'),

  category: text('category').notNull(),
  keywords: blob('keywords').$type<string[]>(),

  homepageUrl: text('homepage_url').notNull(),

  publishedDate: integer({ mode: 'timestamp' }).notNull(),

  createdAt: integer({ mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer({ mode: 'timestamp' }).notNull().defaultNow()
})

export const newsRelations = relations(news, ({ one }) => ({
  thumbnail: one(newsThumbnail, {
    fields: [news.id],
    references: [newsThumbnail.newsId]
  }),
  provider: one(newsProvider, {
    fields: [news.id],
    references: [newsProvider.newsId]
  })
}))

export type News = typeof news.$inferSelect
