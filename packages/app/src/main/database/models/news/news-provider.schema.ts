import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { news } from './news.schema'

export const newsProvider = sqliteTable('news_provider', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  newsId: text('news_id')
    .notNull()
    .references(() => news.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),

  brandId: text('brand_id').notNull(),
  brandName: text('brand_name').notNull(),
  brandUrl: text('brand_url').notNull()
})

export const newsProviderRelations = relations(newsProvider, ({ one }) => ({
  news: one(news, {
    fields: [newsProvider.newsId],
    references: [news.id]
  })
}))

export type NewsProvider = typeof newsProvider.$inferSelect
