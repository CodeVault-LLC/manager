import {
  bigint,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const files = pgTable('files', {
  id: serial('id').primaryKey(),

  filename: text('filename').notNull(),
  bucket: text('bucket').notNull(),
  bucketId: text('bucket_id').notNull(),

  size: bigint('size', { mode: 'number' }).notNull(),
  mimetype: text('mimetype').notNull(),
  filetype: text('filetype').notNull(),

  last_accessed: timestamp('last_accessed').notNull().defaultNow(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
