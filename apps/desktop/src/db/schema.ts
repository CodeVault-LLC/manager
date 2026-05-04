import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey().notNull(),
  value: text("value").notNull(),
});

export const integrationCredentials = sqliteTable("integration_credentials", {
  kind: text("kind").primaryKey().notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: integer("token_expires_at"),
  scopes: text("scopes").notNull().default("[]"),
  connectedAccount: text("connected_account"),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const integrationState = sqliteTable("integration_state", {
  kind: text("kind").primaryKey().notNull(),
  availability: text("availability").notNull().default("unknown"),
  unavailableReason: text("unavailable_reason"),
  driver: text("driver"),
  lastCheckedAt: integer("last_checked_at"),
});
