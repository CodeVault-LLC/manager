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

export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: varchar('name', {
    length: 100,
  }).notNull(),

  logo_id: text('logo_id').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  products: many(products),
  news: many(news),
}));

export type Workspace = typeof workspaces.$inferSelect;
