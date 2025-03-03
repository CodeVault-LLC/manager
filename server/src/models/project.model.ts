import { relations } from 'drizzle-orm';
import {
  AnyPgColumn,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { workspaces } from './workspace.model';
import { users } from './user.model';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', {
    length: 100,
  }).notNull(),
  description: varchar('description', {
    length: 550,
  }).notNull(),

  workspaceId: integer('workspace_id')
    .notNull()
    .references((): AnyPgColumn => workspaces.id),

  updatedById: integer('updated_by_id')
    .notNull()
    .references((): AnyPgColumn => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  updatedBy: one(users, {
    fields: [projects.updatedById],
    references: [users.id],
  }),

  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
