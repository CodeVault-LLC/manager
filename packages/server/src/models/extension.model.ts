import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core';
import { userExtensions, users } from './schema';
import { relations } from 'drizzle-orm';

export const extensions = pgTable('extensions', {
  id: serial('id').primaryKey(),

  // Basic Info
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(), // unique, URL-safe
  description: text('description'),

  // Source/Repo
  repositoryUrl: text('repository_url').notNull(), // e.g., GitHub repo
  releasesUrl: text('releases_url'), // Optional custom endpoint or GitHub releases

  // Latest Release Info
  latestVersion: varchar('latest_version', { length: 100 }).notNull(),
  latestReleaseTag: varchar('latest_release_tag', { length: 100 }),
  manifestUrl: text('manifest_url'), // Direct link to extension.json, validated client-side

  // Ownership and Control
  createdById: integer('created_by_id')
    .references(() => users.id)
    .notNull(),
  isOfficial: boolean('is_official').notNull().default(false), // Your extensions vs external ones
  isVerified: boolean('is_verified').notNull().default(false), // Signed off by you?

  // Permissions/Metadata
  permissions: jsonb('permissions'), // Parsed from extension.json
  categories: jsonb('categories'), // e.g., ["UI", "Debugger", "Tools"]

  // Moderation / Visibility
  isPublic: boolean('is_public').notNull().default(true),
  isListed: boolean('is_listed').notNull().default(true), // For discovery or unlisted

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const extensionsRelations = relations(extensions, ({ one }) => ({
  createdBy: one(users, {
    fields: [extensions.createdById],
    references: [users.id],
  }),

  userExtensions: one(userExtensions, {
    fields: [extensions.id],
    references: [userExtensions.extensionId],
  }),
}));

export type Extension = typeof extensions.$inferSelect;

export type ExtensionMarket = Extension & {
  installedCount: number; // Count of users who have this extension installed
};
