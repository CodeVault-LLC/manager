import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const widgetInstance = sqliteTable('widget_instances', {
  id: text('id').primaryKey().notNull(),
  definitionId: text('definition_id').notNull(),

  layout: text('layout', { mode: 'json' })
    .$type<Record<string, { x: number; y: number; w: number; h: number }>>()
    .notNull(),

  static: integer({ mode: 'boolean' }).notNull().default(false),

  settings: text('settings', { mode: 'json' })
    .$type<Record<string, any>>()
    .default({})
})

export type WidgetInstanceType = typeof widgetInstance.$inferSelect
