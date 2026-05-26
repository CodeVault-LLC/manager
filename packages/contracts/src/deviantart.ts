import { Schema } from "effect";

export const DeviantArtScope = Schema.String;
export type DeviantArtScope = typeof DeviantArtScope.Type;

export const DeviantArtScopeList = Schema.Array(DeviantArtScope);
export type DeviantArtScopeList = typeof DeviantArtScopeList.Type;

export const DeviantArtMediaType = Schema.Literals([
  "image",
  "video",
  "gif",
  "collection",
]);
export type DeviantArtMediaType = typeof DeviantArtMediaType.Type;

export const DeviantArtMediaItem = Schema.Struct({
  id: Schema.String,
  type: DeviantArtMediaType,
  title: Schema.String,
  creator: Schema.String,
  tags: Schema.Array(Schema.String),
  thumbnailUrl: Schema.String,
  mediaUrl: Schema.String,
  collectionPreviewUrls: Schema.Array(Schema.String),
  collectionCount: Schema.NullOr(Schema.Number),
  downloadable: Schema.Boolean,
  durationSeconds: Schema.NullOr(Schema.Number),
  dimensions: Schema.NullOr(Schema.String),
  createdAt: Schema.String,
  viewCount: Schema.Number,
  likeCount: Schema.Number,
  isNSFW: Schema.Boolean,
  collectionId: Schema.NullOr(Schema.String),
});
export type DeviantArtMediaItem = typeof DeviantArtMediaItem.Type;

export const DeviantArtCollection = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  count: Schema.Number,
  imageUrl: Schema.String,
});
export type DeviantArtCollection = typeof DeviantArtCollection.Type;

export const DeviantArtMediaState = Schema.Struct({
  items: Schema.Array(DeviantArtMediaItem),
  collections: Schema.Array(DeviantArtCollection),
  etag: Schema.NullOr(Schema.String),
  pollIntervalSeconds: Schema.Number,
  cacheTtlSeconds: Schema.Number,
  lastCheckedAt: Schema.NullOr(Schema.String),
  nextAllowedAt: Schema.NullOr(Schema.String),
  lastError: Schema.NullOr(Schema.String),
});
export type DeviantArtMediaState = typeof DeviantArtMediaState.Type;

export const DEFAULT_DEVIANTART_MEDIA_STATE: DeviantArtMediaState = {
  items: [],
  collections: [],
  etag: null,
  pollIntervalSeconds: 180,
  cacheTtlSeconds: 180,
  lastCheckedAt: null,
  nextAllowedAt: null,
  lastError: null,
};
