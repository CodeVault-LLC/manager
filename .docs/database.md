# Database — Drizzle ORM with better-sqlite3

This document describes the entire database layer used in the **desktop** Electron app.

---

## Architecture Overview

```
apps/desktop/
├── drizzle.config.ts          ← drizzle-kit CLI config (no Electron imports)
└── src/
    ├── database.ts            ← opens the DB, runs migrations, exports AppDatabase
    ├── settingsService.ts     ← reads/writes settings using Drizzle queries
    └── db/
        ├── schema.ts          ← source of truth: all table definitions
        └── migrations/
            ├── meta/
            │   ├── _journal.json      ← migration history (managed by drizzle-kit)
            │   └── 0000_snapshot.json ← schema snapshot (managed by drizzle-kit)
            └── 0000_freezing_spyke.sql ← initial migration SQL
```

### Key design decisions

| Concern | Decision |
|---|---|
| ORM | Drizzle ORM (`drizzle-orm/better-sqlite3`) |
| Raw driver | `better-sqlite3` (synchronous, no async overhead) |
| Migration strategy | **Automatic on app startup** via `migrate()` in `database.ts` |
| CLI tooling | `drizzle-kit` for schema diffing and Drizzle Studio |
| Type export | `AppDatabase = BetterSQLite3Database<typeof schema>` — fully typed |

---

## Tables

Defined in [src/db/schema.ts](../apps/desktop/src/db/schema.ts).

### `settings`
A key/value store. The server settings are stored as a single JSON blob under the key `"server_settings"`.

| Column | Type | Notes |
|---|---|---|
| `key` | `TEXT` (PK) | Unique setting identifier |
| `value` | `TEXT` | JSON-serialised value |

### `integration_credentials`
OAuth tokens and API keys for each integration.

| Column | Type | Notes |
|---|---|---|
| `kind` | `TEXT` (PK) | Integration identifier (`github`, `bitbucket`, `google`, `mobilbank-sparebank`) |
| `access_token` | `TEXT` | OAuth access token |
| `refresh_token` | `TEXT` | OAuth refresh token (nullable) |
| `token_expires_at` | `INTEGER` | Unix timestamp (nullable) |
| `scopes` | `TEXT` | JSON array of granted scopes |
| `connected_account` | `TEXT` | Username or email (nullable) |
| `updated_at` | `INTEGER` | Unix timestamp, auto-set by SQLite |

### `integration_state`
Runtime availability state for each integration.

| Column | Type | Notes |
|---|---|---|
| `kind` | `TEXT` (PK) | Integration identifier |
| `availability` | `TEXT` | `"available"` \| `"unavailable"` \| `"unknown"` |
| `unavailable_reason` | `TEXT` | Human-readable reason (nullable) |
| `driver` | `TEXT` | Driver name, e.g. `"oauth2"` (nullable) |
| `last_checked_at` | `INTEGER` | Unix timestamp (nullable) |

---

## How migrations work at runtime

When the Electron app starts, `getDatabase()` in `database.ts`:

1. Opens (or creates) the SQLite file at `<userData>/manager.db`
2. Sets `journal_mode = WAL` and `foreign_keys = ON`
3. Creates a Drizzle instance
4. Calls `migrate(db, { migrationsFolder })` which:
   - Reads `_journal.json` to know which migrations exist
   - Creates a `__drizzle_migrations` table in the DB if it doesn't exist
   - Runs any migration SQL files that have not been applied yet
   - Marks each one as applied

**You never need to run a migration command manually.** Just start the app.

The migrations folder is resolved differently in dev vs production:

```
dev:  <repo>/apps/desktop/src/db/migrations/
prod: <app>/dist-electron/migrations/   (copied by the build script)
```

---

## How to add a new migration

### 1. Edit the schema

Change [src/db/schema.ts](../apps/desktop/src/db/schema.ts). For example, to add a `notes` table:

```ts
export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
});
```

### 2. Generate the migration

```bash
cd apps/desktop
bun run db:generate
```

drizzle-kit will diff the schema against the last snapshot and write a new `.sql` file into `src/db/migrations/`. It also updates `meta/_journal.json` and `meta/<N>_snapshot.json`.

**Commit both the `.sql` file and the updated `meta/` files.**

### 3. Ship it

Next time the app starts, `migrate()` applies the new SQL automatically.

---

## drizzle-kit CLI scripts

Run these from `apps/desktop/`:

| Script | Command | What it does |
|---|---|---|
| `bun run db:generate` | `drizzle-kit generate` | Diffs `schema.ts` against the last snapshot and writes a new migration SQL file |
| `bun run db:studio` | `drizzle-kit studio` | Opens Drizzle Studio in the browser to inspect and edit the live dev database |

> **Why is there no `db:migrate` script?**
>
> `drizzle-kit migrate` is a CLI command that runs migrations against a database file.  
> In this project, migrations are applied **automatically** inside the app on every startup via `migrate()` in `database.ts` — no manual step is needed.  
>
> Additionally, `better-sqlite3` is compiled against Electron's Node ABI, so running it under the system Node.js (which `drizzle-kit` uses) would fail with an ABI mismatch error. The programmatic `migrate()` runs correctly inside Electron.

---

## Drizzle Studio (db:studio)

Drizzle Studio opens a browser UI to inspect and modify the dev database directly.

```bash
cd apps/desktop
bun run db:studio
```

The database path is resolved by [drizzle.config.ts](../apps/desktop/drizzle.config.ts) without using Electron. The default paths mirror what Electron uses per OS:

| OS | Default path |
|---|---|
| Linux | `~/.config/Manager/manager.db` |
| macOS | `~/Library/Application Support/Manager/manager.db` |
| Windows | `%APPDATA%\Manager\manager.db` |

You can override this with an environment variable:

```bash
MANAGER_DB_PATH=/tmp/test.db bun run db:studio
```

---

## Why drizzle.config.ts must NOT import Electron

`drizzle-kit` is a plain Node.js CLI tool. It evaluates `drizzle.config.ts` outside of an Electron process, so `app` from `electron` is `undefined` — calling `app.getPath()` throws immediately.

The config file derives the same path using `os.homedir()` and `process.platform` instead.

---

## Adding a query in a new service file

Import `AppDatabase` from `database.ts` and the relevant table from `db/schema.ts`:

```ts
import { eq } from "drizzle-orm";
import type { AppDatabase } from "./database.ts";
import { integrationCredentials } from "./db/schema.ts";

export function getToken(db: AppDatabase, kind: string) {
  return db
    .select({ accessToken: integrationCredentials.accessToken })
    .from(integrationCredentials)
    .where(eq(integrationCredentials.kind, kind))
    .get();
}
```

All queries are fully type-safe — Drizzle infers the return type from the schema.

---

## Native module rebuild (better-sqlite3)

If you update Electron and see an ABI mismatch error like:

```
NODE_MODULE_VERSION X. This version of Node.js requires NODE_MODULE_VERSION Y.
```

Rebuild `better-sqlite3` against the new Electron version:

```bash
cd /path/to/repo
npx @electron/rebuild -f -w better-sqlite3
```
