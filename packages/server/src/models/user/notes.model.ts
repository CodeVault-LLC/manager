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
import { projects } from '../project.model';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  title: text('title').notNull(),
  content: text('content').notNull(),

  projectId: integer('project_id').references(() => projects.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [notes.projectId],
    references: [projects.id],
  }),
}));

export type Note = typeof notes.$inferSelect;
