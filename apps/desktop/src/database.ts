import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { app } from "electron";
import * as Path from "node:path";
import * as schema from "./db/schema.ts";

export type AppDatabase = BetterSQLite3Database<typeof schema>;

let _sqlite: Database.Database | null = null;
let _db: AppDatabase | null = null;

export function getDatabase(): AppDatabase {
  if (_db) return _db;

  const dbPath = Path.join(app.getPath("userData"), "manager.db");
  _sqlite = new Database(dbPath);

  _sqlite.pragma("journal_mode = WAL");
  _sqlite.pragma("foreign_keys = ON");

  _db = drizzle(_sqlite, { schema });

  const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
  const migrationsFolder = isDev
    ? Path.join(__dirname, "../src/db/migrations")
    : Path.join(__dirname, "migrations");

  migrate(_db, { migrationsFolder });

  return _db;
}

export function closeDatabase(): void {
  _sqlite?.close();
  _sqlite = null;
  _db = null;
}
