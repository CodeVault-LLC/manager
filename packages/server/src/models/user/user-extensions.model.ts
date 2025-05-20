import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.model';
import { extensions } from '../extension.model';

export const userExtensions = pgTable('user_extensions', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  extensionId: integer('extension_id')
    .notNull()
    .references(() => extensions.id, { onDelete: 'cascade' }),

  installedVersion: varchar('installed_version', { length: 100 }).notNull(),
  installedAt: timestamp('installed_at').notNull().defaultNow(),

  isEnabled: boolean('is_enabled').notNull().default(true),

  // Optional preferences per user-extension
  userConfig: jsonb('user_config'),

  // Optional: pin version to prevent auto-update
  isPinned: boolean('is_pinned').notNull().default(false),
});

export const userExtensionsRelations = relations(userExtensions, ({ one }) => ({
  userId: one(users, {
    fields: [userExtensions.userId],
    references: [users.id],
  }),

  extensionId: one(extensions, {
    fields: [userExtensions.extensionId],
    references: [extensions.id],
  }),
}));
