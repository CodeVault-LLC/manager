import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { news, products } from '~/models/schema';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', {
    length: 100,
  })
    .unique()
    .notNull(),

  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),

  email: text('email').unique().notNull(),
  password: text('password').notNull(),

  avatarId: text('avatar_id'),

  timezone: varchar('timezone', { length: 100 }).notNull(),
  is_active: boolean('is_active').notNull().default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  news: many(news),
}));

export type User = typeof users.$inferSelect;
