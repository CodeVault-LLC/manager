import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const extensions = sqliteTable('extensions', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }), // same as server ID or slug, must be unique
  extensionId: integer('extension_id').notNull(), // same as server ID or slug, must be unique

  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').notNull(),
  repositoryUrl: text('repository_url'),
  manifestUrl: text('manifest_url'),

  installedVersion: text('installed_version').notNull(),
  installedAt: integer('installed_at', { mode: 'timestamp' }).notNull(),

  isEnabled: integer('is_enabled', {
    mode: 'boolean'
  })
    .notNull()
    .default(true),
  isPinned: integer('is_pinned', {
    mode: 'boolean'
  })
    .notNull()
    .default(false),

  // Local user config
  userConfig: text('user_config_json'), // JSON stringified

  // Optional metadata
  lastCheckedAt: integer('last_checked_at', { mode: 'timestamp' }),
  latestVersionRemote: text('latest_version_remote')
})
