import { Schema } from "effect";
import { IntegrationInstanceId } from "./integrationInstance.ts";

export const ServerIntegrationState = Schema.Literals([
  "ready",
  "warning",
  "error",
  "disabled",
]);
export type ServerIntegrationState = typeof ServerIntegrationState.Type;

export const ServerIntegrationAuthStatus = Schema.Literals([
  "authenticated",
  "unauthenticated",
  "unknown",
]);
export type ServerIntegrationAuthStatus =
  typeof ServerIntegrationAuthStatus.Type;

export const ServerIntegration = Schema.Struct({
  instanceId: IntegrationInstanceId,
  enabled: Schema.Boolean,
  status: ServerIntegrationState,
  auth: ServerIntegrationAuthStatus,
});

export const ServerConfig = Schema.Struct({
  integrations: ServerIntegration,
});
export type ServerConfig = typeof ServerConfig.Type;
