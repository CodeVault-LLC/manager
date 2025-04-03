import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from '../schema';
import { relations } from 'drizzle-orm';
import { enumHelper } from '@/utils/enum';

export enum UserMangaStatus {
  COMPLETED = 'COMPLETED',
  ONGOING = 'ONGOING',
  DROPPED = 'DROPPED',
  PLAN_TO_READ = 'PLAN_TO_READ',
  SEEN = 'SEEN',
}

export const userMangaStatus = pgEnum(
  'user_manga_status',
  enumHelper(UserMangaStatus, UserMangaStatus.COMPLETED),
);

export const userMangas = pgTable('user_mangas', {
  id: serial('id').primaryKey(),
  mangaId: integer('manga_id').notNull(),

  userId: integer('user_id').references(() => users.id),
  chaptersRead: integer('chapters_read').notNull().default(0),
  volumesRead: integer('volumes_read').notNull().default(0),

  status: userMangaStatus('status').default(UserMangaStatus.SEEN).notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userMangasRelations = relations(userMangas, ({ many, one }) => ({
  user: one(users, {
    fields: [userMangas.userId],
    references: [users.id],
  }),
}));

export type UserManga = typeof userMangas.$inferSelect;
