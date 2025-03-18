import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { workspaces } from '../workspace.model';
import { projects } from '../project.model';
import { sessions } from './session.model';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', {
    length: 100,
  })
    .unique()
    .notNull(),

  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),

  email: text('email').unique().notNull(),
  password: text('password').notNull(),

  avatarId: text('avatar_id'),

  timezone: varchar('timezone', { length: 100 }).notNull(),
  isActive: boolean('is_active').notNull().default(false),
  isLocked: boolean('is_locked').notNull().default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  projects: many(projects),
  sessions: many(sessions),
}));

export type User = typeof users.$inferSelect;
