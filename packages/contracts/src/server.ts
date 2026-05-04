import { Schema } from "effect";
import {
  IntegrationInstanceId,
  IntegrationKind,
} from "./integrationInstance.ts";

export { IntegrationKind } from "./integrationInstance.ts";

/**
 * Provider-side health reported by the integration's own status API.
 * - `available`  — operating normally
 * - `degraded`   — partially impaired (e.g. slow responses, some features down)
 * - `outage`     — full or major service outage
 * - `unknown`    — status has not yet been fetched or is unavailable
 */
export const IntegrationAvailability = Schema.Literals([
  "available",
  "degraded",
  "outage",
  "unknown",
]);
export type IntegrationAvailability = typeof IntegrationAvailability.Type;

/**
 * Why the integration is currently unavailable from our side (not the
 * provider's side — see `IntegrationAvailability` for that).
 */
export const IntegrationUnavailableReason = Schema.Literals([
  "rate-limited",
  "blocked",
  "credentials-expired",
  "service-error",
]);
export type IntegrationUnavailableReason =
  typeof IntegrationUnavailableReason.Type;

/** Overall lifecycle state of an integration instance. */
export const ServerIntegrationState = Schema.Literals([
  "ready",
  "warning",
  "error",
  "disabled",
]);
export type ServerIntegrationState = typeof ServerIntegrationState.Type;

/** Whether the integration has valid credentials on file. */
export const ServerIntegrationAuthStatus = Schema.Literals([
  "authenticated",
  "unauthenticated",
  "unknown",
]);
export type ServerIntegrationAuthStatus =
  typeof ServerIntegrationAuthStatus.Type;

/**
 * Runtime snapshot of a single integration instance. Holds observable state
 * only — mutable config lives in `ServerSettings.integrations.*`.
 */
export const ServerIntegration = Schema.Struct({
  /** Stable routing key for this instance (matches the settings key). */
  instanceId: IntegrationInstanceId,
  /** Which provider this instance belongs to. */
  kind: IntegrationKind,
  /** Whether the integration is switched on by the user. */
  enabled: Schema.Boolean,
  /** Lifecycle state computed by the integration manager. */
  status: ServerIntegrationState,
  /** Credential validity — checked on app start and after each connect. */
  auth: ServerIntegrationAuthStatus,
  /** Last-known provider-side health status. */
  availability: IntegrationAvailability,
  /**
   * Machine-readable reason the integration is unavailable on our side.
   * `null` when the integration is reachable.
   */
  unavailableReason: Schema.NullOr(IntegrationUnavailableReason),
  /**
   * Identifier for the active auth/connection driver, e.g. `"oauth2"` or
   * `"personal-access-token"`. `null` before first connect.
   */
  driver: Schema.NullOr(Schema.String),
  /**
   * Display name / identifier for the connected account (username, email …).
   * `null` before first connect.
   */
  connectedAccount: Schema.NullOr(Schema.String),
});
export type ServerIntegration = typeof ServerIntegration.Type;
