/**
 * Settings service — reads and writes `ServerSettings` in the SQLite database.
 *
 * All settings are stored as a single JSON blob under the key `"server_settings"`.
 * Credentials (OAuth tokens) are stored in the dedicated `integration_credentials`
 * table so they can be managed independently.
 */

import { eq } from "drizzle-orm";
import { Schema } from "effect";
import {
  DEFAULT_SERVER_SETTINGS,
  ServerSettingsSchema,
  type ServerSettings,
} from "@manager/contracts/settings";
import type { AppDatabase } from "./database.ts";
import { settings } from "./db/schema.ts";

const SETTINGS_KEY = "server_settings";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readRaw(db: AppDatabase): unknown {
  const row = db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, SETTINGS_KEY))
    .get();

  if (!row) return undefined;

  try {
    return JSON.parse(row.value) as unknown;
  } catch {
    return undefined;
  }
}

function writeRaw(db: AppDatabase, value: unknown): void {
  db.insert(settings)
    .values({ key: SETTINGS_KEY, value: JSON.stringify(value) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: JSON.stringify(value) },
    })
    .run();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read server settings from the database.  Falls back to factory defaults if
 * nothing has been written yet or the stored data fails schema validation.
 */
export function readSettings(db: AppDatabase): ServerSettings {
  const raw = readRaw(db);
  if (raw === undefined) return DEFAULT_SERVER_SETTINGS;

  try {
    return Schema.decodeUnknownSync(ServerSettingsSchema)(raw);
  } catch {
    return DEFAULT_SERVER_SETTINGS;
  }
}

/**
 * Deep-merge `patch` over the current settings and persist the result.
 * Returns the updated settings.
 */
export function updateSettings(
  db: AppDatabase,
  patch: Partial<ServerSettings>,
): ServerSettings {
  const current = readSettings(db);
  const updated: ServerSettings = {
    ...current,
    ...patch,
    integrations: {
      ...current.integrations,
      ...(patch.integrations ?? {}),
      // Merge each integration individually so a partial patch doesn't wipe
      // sibling fields (e.g. patching `github` keeps `bitbucket` intact).
      github: {
        ...current.integrations.github,
        ...(patch.integrations?.github ?? {}),
      },
      bitbucket: {
        ...current.integrations.bitbucket,
        ...(patch.integrations?.bitbucket ?? {}),
      },
      google: {
        ...current.integrations.google,
        ...(patch.integrations?.google ?? {}),
      },
      "mobilbank-sparebank": {
        ...current.integrations["mobilbank-sparebank"],
        ...(patch.integrations?.["mobilbank-sparebank"] ?? {}),
      },
    },
  };

  writeRaw(db, Schema.encodeSync(ServerSettingsSchema)(updated));
  return updated;
}

/**
 * Delete all stored settings and return the factory defaults.
 */
export function resetSettings(db: AppDatabase): ServerSettings {
  db.delete(settings).where(eq(settings.key, SETTINGS_KEY)).run();
  return DEFAULT_SERVER_SETTINGS;
}
