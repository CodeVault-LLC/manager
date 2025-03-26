import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './user.model';
import { relations } from 'drizzle-orm';

export const googleAccounts = pgTable('google_accounts', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  googleId: text('google_id').notNull(),

  email: text('email').notNull(),
  name: text('name').notNull(),
  givenName: text('given_name').notNull(),
  picture: text('picture').notNull(),
  emailVerified: boolean('email_verified').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const googleAccountsRelations = relations(googleAccounts, ({ one }) => ({
  user: one(users, {
    fields: [googleAccounts.userId],
    references: [users.id],
  }),
  googleSession: one(googleSession, {
    fields: [googleAccounts.id],
    references: [googleSession.googleAccountId],
  }),
}));

export type GoogleAccount = typeof googleAccounts.$inferSelect;

export const googleSession = pgTable('google_session', {
  id: serial('id').primaryKey(),

  googleAccountId: integer('google_accounts_id')
    .notNull()
    .references(() => googleAccounts.id),

  sessionId: text('session_id').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresIn: integer('expires_in').notNull(),
});

export const googleSessionRelations = relations(googleSession, ({ one }) => ({
  googleAccount: one(googleAccounts, {
    fields: [googleSession.googleAccountId],
    references: [googleAccounts.id],
  }),
}));

export type GoogleSession = typeof googleSession.$inferSelect;
