import { Schema } from "effect";

export const GithubScopes = Schema.Literals([
  "repo",
  "repo:status",
  "public_repo",
  "repo:invite",
  "security_events",
  "notifications",
]);
export type GithubScopes = typeof GithubScopes.Type;
