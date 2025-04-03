import { relations } from 'drizzle-orm';
import {
  AnyPgColumn,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user/user.model';
import { projects } from './project.model';

export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: varchar('name', {
    length: 100,
  }).notNull(),
  description: varchar('description', {
    length: 550,
  }).notNull(),

  ownerId: integer('owner_id')
    .notNull()
    .references((): AnyPgColumn => users.id),

  logoId: text('logo_id').notNull(),

  updatedById: integer('updated_by_id')
    .notNull()
    .references((): AnyPgColumn => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const workspacesRelations = relations(workspaces, ({ many, one }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [workspaces.updatedById],
    references: [users.id],
  }),
  projects: many(projects),
}));

export type Workspace = typeof workspaces.$inferSelect;
