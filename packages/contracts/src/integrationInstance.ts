import { Schema } from "effect";
import { TrimmedNonEmptyString } from "./baseSchemas.ts";

const PROVIDER_SLUG_MAX_CHARS = 64;
/**
 * Slug pattern shared by driver kinds and instance ids — letters, digits,
 * dashes, underscores. The first character must be a letter so slugs remain
 * JS-identifier friendly when used as object keys, log fields, or telemetry
 * attributes. Mixed case is permitted so historical driver kinds (e.g.
 * `claudeAgent`) can be used verbatim during the migration and so external
 * fork authors retain reasonable freedom.
 */
const PROVIDER_SLUG_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

const slugSchema = TrimmedNonEmptyString.check(
  Schema.isMaxLength(PROVIDER_SLUG_MAX_CHARS),
  Schema.isPattern(PROVIDER_SLUG_PATTERN),
);

/**
 * `IntegrationInstanceId` — user-defined routing key for a configured provider
 * instance. Same slug rules as `ProviderDriverKind`; branded separately so the
 * type system cannot confuse the two.
 */
export const IntegrationInstanceId = slugSchema.pipe(
  Schema.brand("IntegrationInstanceId"),
);
export type IntegrationInstanceId = typeof IntegrationInstanceId.Type;

/**
 * `IntegrationKind` — identifies one of the supported integration providers.
 * Branded so the type system distinguishes it from arbitrary strings.
 */
export const IntegrationKind = Schema.Literals([
  "github",
  "bitbucket",
  "google",
  "mobilbank-sparebank",
]);
export type IntegrationKind = typeof IntegrationKind.Type;

/** Branded OAuth access token — non-empty trimmed string. */
export const OAuthAccessToken = TrimmedNonEmptyString.pipe(
  Schema.brand("OAuthAccessToken"),
);
export type OAuthAccessToken = typeof OAuthAccessToken.Type;

/** Branded OAuth refresh token — non-empty trimmed string. */
export const OAuthRefreshToken = TrimmedNonEmptyString.pipe(
  Schema.brand("OAuthRefreshToken"),
);
export type OAuthRefreshToken = typeof OAuthRefreshToken.Type;

/** Branded OAuth client ID — non-empty trimmed string. */
export const OAuthClientId = TrimmedNonEmptyString.pipe(
  Schema.brand("OAuthClientId"),
);
export type OAuthClientId = typeof OAuthClientId.Type;
