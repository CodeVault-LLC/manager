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
import { notes } from './notes.model';
import { googleAccounts } from './google.model';
import { userMangas } from '../entertainment/manga.model';
import { tokens } from './token.model';

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
  verifiedEmail: boolean('verified_email').notNull().default(false),

  password: text('password').notNull(),

  avatarId: text('avatar_id'),

  timezone: varchar('timezone', { length: 100 }).notNull(),
  isActive: boolean('is_active').notNull().default(false),
  isLocked: boolean('is_locked').notNull().default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  workspaces: many(workspaces),
  projects: many(projects),
  sessions: many(sessions),
  notes: many(notes),
  tokens: many(tokens),

  mangas: many(userMangas),

  googleAccount: one(googleAccounts, {
    fields: [users.id],
    references: [googleAccounts.userId],
  }),
}));

export type User = typeof users.$inferSelect;
