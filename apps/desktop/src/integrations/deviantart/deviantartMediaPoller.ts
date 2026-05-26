import type {
  DeviantArtCollection,
  DeviantArtMediaItem,
  DeviantArtMediaState,
} from "@manager/contracts";
import { DEFAULT_DEVIANTART_MEDIA_STATE } from "@manager/contracts";
import type { AppDatabase } from "../../database.ts";
import { readSettings } from "../../settingsService.ts";
import {
  readDeviantArtMediaState,
  writeDeviantArtMediaState,
} from "./deviantartMediaStore.ts";

const DEVIANTART_COLLECTIONS_FOLDERS_URL =
  "https://www.deviantart.com/api/v1/oauth2/collections/folders";
const DEVIANTART_COLLECTIONS_URL_PATTERN =
  "https://www.deviantart.com/api/v1/oauth2/collections";
const DEVIANTART_BROWSE_URL =
  "https://www.deviantart.com/api/v1/oauth2/browse/popular";

const FALLBACK_POLL_INTERVAL_SECONDS = 180;
const MIN_POLL_INTERVAL_SECONDS = 30;
const FALLBACK_CACHE_TTL_SECONDS = 180;
const MAX_STORED_MEDIA_ITEMS = 200;
const MAX_SYNTHETIC_COLLECTIONS = 24;

function parseHeaderNumber(value: string | null): number | null {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function resolvePollInterval(
  response: Response,
  cached: DeviantArtMediaState,
): number {
  const retryAfter = parseHeaderNumber(response.headers.get("retry-after"));
  if (retryAfter !== null) {
    return Math.max(MIN_POLL_INTERVAL_SECONDS, retryAfter);
  }

  const resetAtEpoch = parseHeaderNumber(
    response.headers.get("x-ratelimit-reset"),
  );
  if (resetAtEpoch !== null) {
    const secondsUntilReset = Math.ceil(resetAtEpoch - Date.now() / 1000);
    if (secondsUntilReset > 0) {
      return Math.max(MIN_POLL_INTERVAL_SECONDS, secondsUntilReset);
    }
  }

  return Math.max(
    MIN_POLL_INTERVAL_SECONDS,
    cached.pollIntervalSeconds || FALLBACK_POLL_INTERVAL_SECONDS,
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

function resolveContentType(
  item: Record<string, unknown>,
): DeviantArtMediaItem["type"] {
  const raw = String(item["type"] ?? "").toLowerCase();
  if (raw.includes("film") || raw.includes("video")) return "video";

  const content =
    typeof item["content"] === "object" && item["content"] !== null
      ? (item["content"] as Record<string, unknown>)
      : {};
  const src = String(content["src"] ?? "").toLowerCase();
  if (src.endsWith(".gif") || src.includes(".gif?")) return "gif";

  return "image";
}

function resolveCreator(item: Record<string, unknown>): string {
  const author =
    typeof item["author"] === "object" && item["author"] !== null
      ? (item["author"] as Record<string, unknown>)
      : {};
  return String(author["username"] ?? author["userid"] ?? "unknown");
}

function resolveTags(item: Record<string, unknown>): string[] {
  const tagsRaw = Array.isArray(item["tags"]) ? item["tags"] : [];
  const mappedTags = tagsRaw
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (typeof tag === "object" && tag !== null) {
        return String((tag as Record<string, unknown>)["tag_name"] ?? "");
      }
      return "";
    })
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  const categoryPath = String(item["category_path"] ?? "");
  const categoryTags = categoryPath
    .split("/")
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...mappedTags, ...categoryTags])).slice(0, 16);
}

function resolveCollectionId(item: Record<string, unknown>): string | null {
  const folder =
    typeof item["folder"] === "object" && item["folder"] !== null
      ? (item["folder"] as Record<string, unknown>)
      : {};
  const folderId = String(
    item["folderid"] ?? item["folder_id"] ?? folder["folderid"] ?? "",
  ).trim();
  if (folderId) {
    return `gallery-${folderId}`;
  }

  const categoryPath = String(item["category_path"] ?? "").trim();
  if (!categoryPath) return null;

  const normalized = categoryPath.toLowerCase().replace(/[^a-z0-9/_-]+/g, "-");
  return normalized || null;
}

function mapDeviation(
  item: Record<string, unknown>,
): DeviantArtMediaItem | null {
  const content =
    typeof item["content"] === "object" && item["content"] !== null
      ? (item["content"] as Record<string, unknown>)
      : {};
  const preview =
    typeof item["preview"] === "object" && item["preview"] !== null
      ? (item["preview"] as Record<string, unknown>)
      : {};
  const thumbsRaw = Array.isArray(item["thumbs"]) ? item["thumbs"] : [];

  const thumbnailCandidates = [
    String(preview["src"] ?? "").trim(),
    ...thumbsRaw
      .filter(
        (thumb): thumb is Record<string, unknown> =>
          typeof thumb === "object" && thumb !== null,
      )
      .map((thumb) => String(thumb["src"] ?? "").trim()),
    String(content["src"] ?? "").trim(),
  ].filter(Boolean);

  const mediaUrl = String(content["src"] ?? item["url"] ?? "").trim();
  const thumbnailUrl = thumbnailCandidates[0] ?? mediaUrl;
  if (!mediaUrl || !thumbnailUrl) return null;

  const width = Number(content["width"] ?? 0);
  const height = Number(content["height"] ?? 0);
  const dimensions = width > 0 && height > 0 ? `${width}x${height}` : null;

  const stats =
    typeof item["stats"] === "object" && item["stats"] !== null
      ? (item["stats"] as Record<string, unknown>)
      : {};

  const id = String(item["deviationid"] ?? item["deviation_id"] ?? "").trim();
  if (!id) return null;

  return {
    id: `deviantart-${id}`,
    type: resolveContentType(item),
    title: String(item["title"] ?? "Untitled").trim() || "Untitled",
    creator: resolveCreator(item),
    tags: resolveTags(item),
    thumbnailUrl,
    mediaUrl,
    collectionPreviewUrls: [],
    collectionCount: null,
    downloadable: Boolean(item["allows_download"] ?? item["is_downloadable"]),
    durationSeconds: null,
    dimensions,
    createdAt: String(item["published_time"] ?? item["published"] ?? nowIso()),
    viewCount: Number(stats["views"] ?? 0),
    likeCount: Number(stats["favourites"] ?? 0),
    isNSFW: Boolean(item["is_mature"]),
    collectionId: resolveCollectionId(item),
  };
}

function synthesizeCollections(
  items: DeviantArtMediaItem[],
): DeviantArtCollection[] {
  const groups = new Map<
    string,
    {
      count: number;
      title: string;
      previewUrls: string[];
    }
  >();

  for (const item of items) {
    if (!item.collectionId) continue;

    const entry = groups.get(item.collectionId) ?? {
      count: 0,
      title: item.collectionId.replaceAll("/", " - "),
      previewUrls: [],
    };

    entry.count += 1;
    if (entry.previewUrls.length < 4 && item.thumbnailUrl) {
      entry.previewUrls.push(item.thumbnailUrl);
    }

    groups.set(item.collectionId, entry);
  }

  return Array.from(groups.entries())
    .map(([id, info]) => ({
      id,
      title: info.title,
      count: info.count,
      imageUrl: info.previewUrls[0] ?? "",
    }))
    .filter((collection) => Boolean(collection.imageUrl))
    .slice(0, MAX_SYNTHETIC_COLLECTIONS);
}

function synthesizeCollectionCards(
  items: DeviantArtMediaItem[],
  collections: DeviantArtCollection[],
): DeviantArtMediaItem[] {
  return collections.map((collection) => {
    const previews = items
      .filter((item) => item.collectionId === collection.id)
      .slice(0, 4)
      .map((item) => item.thumbnailUrl)
      .filter(Boolean);

    return {
      id: `deviantart-collection-${collection.id}`,
      type: "collection",
      title: collection.title,
      creator: "DeviantArt Gallery",
      tags: ["collection", "gallery"],
      thumbnailUrl: collection.imageUrl,
      mediaUrl: collection.imageUrl,
      collectionPreviewUrls: previews,
      collectionCount: collection.count,
      downloadable: false,
      durationSeconds: null,
      dimensions: null,
      createdAt: nowIso(),
      viewCount: 0,
      likeCount: 0,
      isNSFW: false,
      collectionId: collection.id,
    };
  });
}

function mergeCollections(
  imported: DeviantArtCollection[],
  synthesized: DeviantArtCollection[],
): DeviantArtCollection[] {
  const byId = new Map<string, DeviantArtCollection>();

  for (const collection of [...imported, ...synthesized]) {
    const current = byId.get(collection.id);
    if (!current) {
      byId.set(collection.id, collection);
      continue;
    }

    byId.set(collection.id, {
      ...current,
      count: Math.max(current.count, collection.count),
      imageUrl: current.imageUrl || collection.imageUrl,
      title: current.title || collection.title,
    });
  }

  return Array.from(byId.values()).slice(0, MAX_SYNTHETIC_COLLECTIONS);
}

export async function pollDeviantArtMedia(
  db: AppDatabase,
  options?: { force?: boolean },
): Promise<DeviantArtMediaState> {
  const settings = readSettings(db);
  const deviantart = settings.integrations.deviantart;
  const connectedUsername = deviantart.connectedUsername?.trim() || null;
  const cached = readDeviantArtMediaState(db);
  const now = new Date();

  if (!deviantart.enabled || !deviantart.accessToken) {
    return cached;
  }

  const nextAllowed = cached.nextAllowedAt
    ? new Date(cached.nextAllowedAt)
    : null;
  if (!options?.force && nextAllowed && nextAllowed > now) {
    return cached;
  }

  const lastChecked = cached.lastCheckedAt
    ? new Date(cached.lastCheckedAt)
    : null;
  if (
    !options?.force &&
    lastChecked &&
    now.getTime() - lastChecked.getTime() < cached.cacheTtlSeconds * 1000
  ) {
    return cached;
  }

  let response: Response;
  try {
    const requestHeaders = {
      Accept: "application/json",
      Authorization: `Bearer ${deviantart.accessToken}`,
    };

    console.log("[deviantart-media] polling feed", {
      connectedUsername,
    });

    // Step 1: Fetch the list of collection folders
    console.log("[deviantart-media] fetching collection folders", {
      url: DEVIANTART_COLLECTIONS_FOLDERS_URL,
    });

    const foldersResponse = await fetch(
      `${DEVIANTART_COLLECTIONS_FOLDERS_URL}?limit=24`,
      { headers: requestHeaders },
    );

    if (!foldersResponse.ok) {
      throw new Error(
        `Failed to fetch collection folders: ${foldersResponse.status}`,
      );
    }

    const foldersPayload = (await foldersResponse.json()) as Record<
      string,
      unknown
    >;
    const folders = Array.isArray(foldersPayload["results"])
      ? foldersPayload["results"]
      : [];

    console.log("[deviantart-media] found folders", {
      folderCount: folders.length,
    });

    // Step 2: Fetch items from each collection folder
    const allItems: DeviantArtMediaItem[] = [];
    const importedCollections: DeviantArtCollection[] = [];

    for (const folder of folders) {
      if (typeof folder !== "object" || folder === null) continue;

      const folderObj = folder as Record<string, unknown>;
      const folderid = String(folderObj["folderid"] ?? "").trim();
      if (!folderid) continue;

      const folderName = String(folderObj["name"] ?? folderid).trim();
      const folderSize = Number(folderObj["size"] ?? 0);

      console.log("[deviantart-media] fetching collection items", {
        folderid,
        folderName,
      });

      try {
        const collectionParams = new URLSearchParams({
          limit: "24",
          offset: "0",
          with_session: "true",
          mature_content: "true",
          expand: "user.watch",
          ...(connectedUsername ? { username: connectedUsername } : {}),
        });
        const collectionResponse = await fetch(
          `${DEVIANTART_COLLECTIONS_URL_PATTERN}/${folderid}?${collectionParams.toString()}`,
          { headers: requestHeaders },
        );

        if (!collectionResponse.ok) {
          console.warn("[deviantart-media] failed to fetch collection", {
            folderid,
            status: collectionResponse.status,
          });
          continue;
        }

        const collectionPayload = (await collectionResponse.json()) as Record<
          string,
          unknown
        >;

        console.log("[deviantart-media] collection response", {
          folderid,
          payloadKeys: Object.keys(collectionPayload),
          payload: collectionPayload,
        });

        const items = Array.isArray(collectionPayload["results"])
          ? collectionPayload["results"]
          : [];

        const mappedItems = items
          .filter(
            (item): item is Record<string, unknown> =>
              typeof item === "object" && item !== null,
          )
          .map((item) => {
            // Set the folderid for collection association
            const enhanced = { ...item, folderid };
            return mapDeviation(enhanced);
          })
          .filter((item): item is DeviantArtMediaItem => item !== null);

        allItems.push(...mappedItems);

        // Create collection entry from folder metadata
        if (folderSize > 0 || mappedItems.length > 0) {
          const thumbUrl =
            Array.isArray(folderObj["thumb"]) &&
            typeof folderObj["thumb"][0] === "object" &&
            folderObj["thumb"][0] !== null
              ? String(
                  (folderObj["thumb"][0] as Record<string, unknown>)["src"] ??
                    "",
                ).trim()
              : (mappedItems[0]?.thumbnailUrl ?? "");

          if (thumbUrl) {
            importedCollections.push({
              id: `gallery-${folderid}`,
              title: folderName,
              count: folderSize || mappedItems.length,
              imageUrl: thumbUrl,
            });
          }
        }
      } catch (error) {
        console.warn("[deviantart-media] error fetching collection items", {
          folderid,
          error,
        });
        continue;
      }
    }

    console.log("[deviantart-media] collected items", {
      itemCount: allItems.length,
      collectionCount: importedCollections.length,
    });

    const mappedItems = allItems.slice(0, MAX_STORED_MEDIA_ITEMS);
    const synthesized = synthesizeCollections(mappedItems);
    const collections = mergeCollections(importedCollections, synthesized);
    const collectionCards = synthesizeCollectionCards(mappedItems, collections);

    const nextState: DeviantArtMediaState = {
      items: [...collectionCards, ...mappedItems],
      collections,
      etag: cached.etag,
      pollIntervalSeconds: FALLBACK_POLL_INTERVAL_SECONDS,
      cacheTtlSeconds: FALLBACK_CACHE_TTL_SECONDS,
      lastCheckedAt: nowIso(),
      nextAllowedAt: null,
      lastError: null,
    };

    writeDeviantArtMediaState(db, nextState);

    console.info("[deviantart-media] polled", {
      status: 200,
      itemCount: nextState.items.length,
      collectionCount: nextState.collections.length,
      pollIntervalSeconds: FALLBACK_POLL_INTERVAL_SECONDS,
    });

    return nextState;
  } catch (error) {
    console.log("[deviantart-media] poll error", { error });

    const nextState: DeviantArtMediaState = {
      ...cached,
      pollIntervalSeconds: Math.max(
        MIN_POLL_INTERVAL_SECONDS,
        cached.pollIntervalSeconds || FALLBACK_POLL_INTERVAL_SECONDS,
      ),
      cacheTtlSeconds: FALLBACK_CACHE_TTL_SECONDS,
      lastCheckedAt: nowIso(),
      nextAllowedAt: new Date(Date.now() + 60_000).toISOString(),
      lastError:
        error instanceof Error
          ? `DeviantArt API error: ${error.message}`
          : "Network error while fetching DeviantArt collections.",
    };
    writeDeviantArtMediaState(db, nextState);
    console.warn("[deviantart-media] poll request failed", { error });
    return nextState;
  }
}

export function clearDeviantArtMediaCache(db: AppDatabase): void {
  writeDeviantArtMediaState(db, DEFAULT_DEVIANTART_MEDIA_STATE);
}
