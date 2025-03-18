import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './user.model';

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  sessionToken: text('session_token').notNull().unique(),

  ipAddress: text('ip_address').notNull(),
  systemInfo: text('system_info').notNull(),

  deviceFingerprint: text('device_fingerprint').notNull(),

  isActive: boolean('is_active').notNull().default(true),

  lastUsedAt: timestamp('last_used_at').notNull().defaultNow(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Session = typeof sessions.$inferSelect;
