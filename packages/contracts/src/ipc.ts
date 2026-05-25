import type { IntegrationKind } from "./integrationInstance.ts";
import type { ServerIntegration } from "./server.ts";
import type { ServerSettings } from "./settings.ts";
import type { GithubNotificationsState } from "./github.ts";

export type DesktopUpdateChannel = "latest" | "nightly";
export type DesktopAppStageLabel = "Alpha" | "Dev" | "Nightly";

export interface DesktopAppBranding {
  baseName: string;
  stageLabel: DesktopAppStageLabel;
  displayName: string;
}

/**
 * Full configuration snapshot sent from the main process to the renderer.
 * The renderer stores this in `serverConfigAtom`.
 */
export interface ServerConfig {
  /** User-configured settings persisted in SQLite. */
  settings: ServerSettings;
  /**
   * Live runtime state per integration kind. The main process populates
   * this on startup and after each connect/disconnect.
   */
  integrations: Partial<Record<IntegrationKind, ServerIntegration>>;
  /** Last cached GitHub notifications and poll metadata. */
  githubNotifications: GithubNotificationsState;
}

export type ConnectIntegrationStatus = "started" | "completed";

/** Result shape returned by `connectIntegration`. */
export interface ConnectIntegrationResult {
  success: boolean;
  /** `started` means callback-based flow continues asynchronously. */
  status?: ConnectIntegrationStatus;
  /** Human-readable error message if `success` is `false`. */
  error?: string;
}

/**
 * The IPC bridge exposed to the renderer via `contextBridge`.
 * All methods are async (return `Promise`) to allow the main process to
 * perform I/O without blocking the renderer.
 */
export interface DesktopBridge {
  /** Returns current app branding (synchronous, light-weight). */
  getAppBranding: () => DesktopAppBranding | null;

  // ── Settings ────────────────────────────────────────────────────────────

  /** Fetch the full server config (settings + runtime integration state). */
  getServerConfig: () => Promise<ServerConfig>;

  /**
   * Persist a partial settings update.  Only the provided keys are merged;
   * omitted keys keep their current values.
   */
  updateSettings: (patch: Partial<ServerSettings>) => Promise<ServerConfig>;

  /** Reset all server-side settings to factory defaults. */
  resetSettings: () => Promise<ServerConfig>;

  // ── Integrations ────────────────────────────────────────────────────────

  /**
   * Initiate the connect flow for an integration (e.g. open a browser for
   * OAuth2).  Resolves once the flow completes (or fails).
   */
  connectIntegration: (
    kind: IntegrationKind,
  ) => Promise<ConnectIntegrationResult>;

  /**
   * Revoke credentials and reset the integration to its disconnected state.
   */
  disconnectIntegration: (kind: IntegrationKind) => Promise<ServerConfig>;
}

export interface LocalApi {}
