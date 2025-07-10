import { WidgetRequirement, WidgetSetting } from '@manager/common/src'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey().notNull(),
  definitionId: text('definition_id').notNull(), // FK to widgetDefinitions

  layout: text('layout', { mode: 'json' })
    .$type<Record<string, { x: number; y: number; w: number; h: number }>>()
    .notNull(),

  static: integer({ mode: 'boolean' }).notNull().default(false),

  settings: text('settings', { mode: 'json' })
    .$type<Record<string, any>>()
    .default({}),

  active: integer({ mode: 'boolean' }).notNull().default(true)
})

export const widgetDefinitions = sqliteTable('widget_definitions', {
  id: text('id').primaryKey().notNull(), // e.g., 'calendar', 'system'
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // e.g., 'monitoring', 'calendar', 'media'

  settingsSchema: text('settings_schema', { mode: 'json' }) // WidgetSettingSchema
    .$type<Record<string, WidgetSetting>>()
    .notNull(),

  requirements: text('requirements', { mode: 'json' })
    .$type<WidgetRequirement[]>()
    .default([]),

  locales: text('locales', { mode: 'json' })
    .$type<string[]>() // ['en-US', 'no-NO', ...]
    .default([])
})

export type WidgetDefinitionsType = typeof widgetDefinitions.$inferSelect
export type WidgetItemType = typeof widgets.$inferSelect
