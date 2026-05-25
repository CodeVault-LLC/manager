import { eq } from "drizzle-orm";
import { Schema } from "effect";
import {
  DEFAULT_GITHUB_NOTIFICATIONS_STATE,
  GithubNotificationsState,
  type GithubNotificationsState as GithubNotificationsStateType,
} from "@manager/contracts";
import type { AppDatabase } from "../database.ts";
import { settings } from "../db/schema.ts";

const GITHUB_NOTIFICATIONS_KEY = "github_notifications_state";

function readRaw(db: AppDatabase): unknown {
  const row = db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, GITHUB_NOTIFICATIONS_KEY))
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
    .values({ key: GITHUB_NOTIFICATIONS_KEY, value: JSON.stringify(value) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: JSON.stringify(value) },
    })
    .run();
}

export function readGithubNotificationsState(
  db: AppDatabase,
): GithubNotificationsStateType {
  const raw = readRaw(db);
  if (raw === undefined) {
    return DEFAULT_GITHUB_NOTIFICATIONS_STATE;
  }

  try {
    return Schema.decodeUnknownSync(GithubNotificationsState)(raw);
  } catch {
    return DEFAULT_GITHUB_NOTIFICATIONS_STATE;
  }
}

export function writeGithubNotificationsState(
  db: AppDatabase,
  state: GithubNotificationsStateType,
): GithubNotificationsStateType {
  const encoded = Schema.encodeSync(GithubNotificationsState)(state);
  writeRaw(db, encoded);
  return state;
}
