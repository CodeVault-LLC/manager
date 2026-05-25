import { Schema } from "effect";

export const GithubScopes = Schema.Literals([
  "read:user",
  "user:email",
  "repo",
  "repo:status",
  "public_repo",
  "repo:invite",
  "security_events",
  "notifications",
]);
export type GithubScopes = typeof GithubScopes.Type;

export const GithubScope = Schema.String;
export type GithubScope = typeof GithubScope.Type;

export const GithubScopeList = Schema.Array(GithubScope);
export type GithubScopeList = typeof GithubScopeList.Type;

export const GithubNotificationSubject = Schema.Struct({
  title: Schema.String,
  type: Schema.String,
  url: Schema.NullOr(Schema.String),
  latestCommentUrl: Schema.NullOr(Schema.String),
});
export type GithubNotificationSubject = typeof GithubNotificationSubject.Type;

export const GithubNotificationRepository = Schema.Struct({
  fullName: Schema.String,
  htmlUrl: Schema.String,
});
export type GithubNotificationRepository =
  typeof GithubNotificationRepository.Type;

export const GithubNotificationItem = Schema.Struct({
  id: Schema.String,
  unread: Schema.Boolean,
  reason: Schema.String,
  updatedAt: Schema.String,
  lastReadAt: Schema.NullOr(Schema.String),
  webUrl: Schema.NullOr(Schema.String),
  subject: GithubNotificationSubject,
  repository: GithubNotificationRepository,
});
export type GithubNotificationItem = typeof GithubNotificationItem.Type;

export const GithubNotificationsState = Schema.Struct({
  items: Schema.Array(GithubNotificationItem),
  etag: Schema.NullOr(Schema.String),
  pollIntervalSeconds: Schema.Number,
  lastCheckedAt: Schema.NullOr(Schema.String),
});
export type GithubNotificationsState = typeof GithubNotificationsState.Type;

export const DEFAULT_GITHUB_NOTIFICATIONS_STATE: GithubNotificationsState = {
  items: [],
  etag: null,
  pollIntervalSeconds: 60,
  lastCheckedAt: null,
};
