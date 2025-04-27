import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.model';
import { relations } from 'drizzle-orm';

type TokenType =
  | 'email_verification'
  | 'password_reset'
  | 'email_change'
  | 'two_factor_auth';

export const tokens = pgTable('tokens', {
  id: serial('id').primaryKey(),

  token: text('token').notNull(),
  type: text('type').notNull().$type<TokenType>(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
  users: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));
