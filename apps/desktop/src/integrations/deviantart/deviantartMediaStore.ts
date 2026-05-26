import { eq } from "drizzle-orm";
import { Schema } from "effect";
import {
  DEFAULT_DEVIANTART_MEDIA_STATE,
  DeviantArtMediaState,
  type DeviantArtMediaState as DeviantArtMediaStateType,
} from "@manager/contracts";
import type { AppDatabase } from "../../database.ts";
import { settings } from "../../db/schema.ts";

const DEVIANTART_MEDIA_KEY = "deviantart_media_state";

function readRaw(db: AppDatabase): unknown {
  const row = db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, DEVIANTART_MEDIA_KEY))
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
    .values({ key: DEVIANTART_MEDIA_KEY, value: JSON.stringify(value) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: JSON.stringify(value) },
    })
    .run();
}

export function readDeviantArtMediaState(
  db: AppDatabase,
): DeviantArtMediaStateType {
  const raw = readRaw(db);
  if (raw === undefined) {
    return DEFAULT_DEVIANTART_MEDIA_STATE;
  }

  try {
    return Schema.decodeUnknownSync(DeviantArtMediaState)(raw);
  } catch {
    return DEFAULT_DEVIANTART_MEDIA_STATE;
  }
}

export function writeDeviantArtMediaState(
  db: AppDatabase,
  state: DeviantArtMediaStateType,
): DeviantArtMediaStateType {
  const encoded = Schema.encodeSync(DeviantArtMediaState)(state);
  writeRaw(db, encoded);
  return state;
}
