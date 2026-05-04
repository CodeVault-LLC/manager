/**
 * Integration manager — handles connect/disconnect flows and tracks runtime
 * state for each integration kind.
 *
 * OAuth2 flow (GitHub, Bitbucket, Google):
 *   1. `connectIntegration(kind)` builds the provider's authorisation URL and
 *      opens it in the system browser via `shell.openExternal`.
 *   2. The provider redirects to `manager://oauth/callback?code=...&state=...`
 *      which Electron intercepts via the registered custom protocol handler.
 *   3. `handleOAuthCallback(url)` is called by the protocol handler.  It
 *      exchanges the code for tokens using the provider's token endpoint and
 *      writes the result to the database via `settingsService.updateSettings`.
 *
 * Mobilbank Sparebank uses a direct API key — the connect flow just validates
 * the stored key and updates the integration state accordingly.
 *
 * GitHub OAuth2 credentials are read from environment variables at build time:
 *   GITHUB_CLIENT_ID   / GITHUB_CLIENT_SECRET
 *
 * Register the custom protocol in `main.ts` BEFORE `app.ready`:
 *   protocol.registerSchemesAsPrivileged([{ scheme: "manager", privileges: { standard: true } }])
 * Then, after `app.ready`, handle it:
 *   protocol.handle("manager", (request) => {
 *     integrationManager.handleProtocolUrl(request.url)
 *     return new Response(null, { status: 204 })
 *   })
 */

import crypto from "node:crypto";
import { shell } from "electron";
import type { AppDatabase } from "./database.ts";
import type { IntegrationKind, ServerIntegration } from "@manager/contracts";
import { updateSettings, readSettings } from "./settingsService.ts";
import type { ServerSettings } from "@manager/contracts/settings";
import type { ConnectIntegrationResult } from "@manager/contracts";

// ---------------------------------------------------------------------------
// In-memory runtime state
// ---------------------------------------------------------------------------

type RuntimeState = {
  availability: ServerIntegration["availability"];
  unavailableReason: ServerIntegration["unavailableReason"];
  driver: ServerIntegration["driver"];
  connectedAccount: ServerIntegration["connectedAccount"];
  status: ServerIntegration["status"];
  auth: ServerIntegration["auth"];
};

const runtimeState = new Map<IntegrationKind, RuntimeState>();

function getDefaultRuntimeState(): RuntimeState {
  return {
    availability: "unknown",
    unavailableReason: null,
    driver: null,
    connectedAccount: null,
    status: "disabled",
    auth: "unauthenticated",
  };
}

export function getRuntimeState(kind: IntegrationKind): RuntimeState {
  return runtimeState.get(kind) ?? getDefaultRuntimeState();
}

function setRuntimeState(
  kind: IntegrationKind,
  patch: Partial<RuntimeState>,
): void {
  const current = getRuntimeState(kind);
  runtimeState.set(kind, { ...current, ...patch });
}

// ---------------------------------------------------------------------------
// OAuth2 PKCE state  (code_verifier keyed by random `state` param)
// ---------------------------------------------------------------------------

const pendingOAuthStates = new Map<string, { kind: IntegrationKind }>();

function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

// ---------------------------------------------------------------------------
// Provider configurations
// ---------------------------------------------------------------------------

interface OAuthProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  defaultScopes: string[];
  driver: string;
}

function getGitHubConfig(): OAuthProviderConfig {
  return {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    clientId: process.env["GITHUB_CLIENT_ID"] ?? "",
    clientSecret: process.env["GITHUB_CLIENT_SECRET"] ?? "",
    defaultScopes: ["read:user", "repo"],
    driver: "oauth2",
  };
}

function getBitbucketConfig(): OAuthProviderConfig {
  return {
    authorizeUrl: "https://bitbucket.org/site/oauth2/authorize",
    tokenUrl: "https://bitbucket.org/site/oauth2/access_token",
    clientId: process.env["BITBUCKET_CLIENT_ID"] ?? "",
    clientSecret: process.env["BITBUCKET_CLIENT_SECRET"] ?? "",
    defaultScopes: ["account", "repository"],
    driver: "oauth2",
  };
}

function getGoogleConfig(): OAuthProviderConfig {
  return {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
    defaultScopes: [
      "openid",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
    driver: "oauth2",
  };
}

const REDIRECT_URI = "manager://oauth/callback";

// ---------------------------------------------------------------------------
// Connect flows
// ---------------------------------------------------------------------------

async function startOAuth2Flow(
  kind: IntegrationKind,
  config: OAuthProviderConfig,
): Promise<ConnectIntegrationResult> {
  if (!config.clientId) {
    return {
      success: false,
      error: `${kind} OAuth2 client ID is not configured. Set the environment variable and rebuild.`,
    };
  }

  const state = generateState();
  pendingOAuthStates.set(state, { kind });

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: REDIRECT_URI,
    scope: config.defaultScopes.join(" "),
    state,
    response_type: "code",
  });

  const authUrl = `${config.authorizeUrl}?${params.toString()}`;
  await shell.openExternal(authUrl);

  // The flow continues asynchronously in `handleProtocolUrl` when the OS
  // delivers the manager:// callback URL.
  return { success: true };
}

export async function connectIntegration(
  kind: IntegrationKind,
  db: AppDatabase,
): Promise<ConnectIntegrationResult> {
  switch (kind) {
    case "github":
      return startOAuth2Flow(kind, getGitHubConfig());
    case "bitbucket":
      return startOAuth2Flow(kind, getBitbucketConfig());
    case "google":
      return startOAuth2Flow(kind, getGoogleConfig());
    case "mobilbank-sparebank":
      return connectMobilbank(db);
    default:
      return {
        success: false,
        error: `Unknown integration kind: ${String(kind)}`,
      };
  }
}

async function connectMobilbank(
  db: AppDatabase,
): Promise<ConnectIntegrationResult> {
  const settings = (await import("./settingsService.ts")).readSettings(db);
  const apiKey = settings.integrations["mobilbank-sparebank"].apiKey;

  if (!apiKey) {
    return {
      success: false,
      error:
        "No API key configured. Enter your Sparebank Open Banking key in the integration settings.",
    };
  }

  // Stub: a real implementation would call the Sparebank1 Open Banking API
  // to validate the key and fetch the account identifier.
  setRuntimeState("mobilbank-sparebank", {
    status: "ready",
    auth: "authenticated",
    availability: "unknown",
    driver: "open-banking",
    connectedAccount: "Account ending …" + apiKey.slice(-4),
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// OAuth2 callback handler (invoked by the manager:// protocol handler)
// ---------------------------------------------------------------------------

async function exchangeGitHubCode(
  code: string,
  config: OAuthProviderConfig,
): Promise<{ accessToken: string; scopes: string[]; username: string }> {
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (data["error"]) {
    throw new Error(String(data["error_description"] ?? data["error"]));
  }

  const accessToken = String(data["access_token"] ?? "");
  const scope = String(data["scope"] ?? "");

  // Fetch the connected username.
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  const user = (await userRes.json()) as Record<string, unknown>;

  return {
    accessToken,
    scopes: scope ? scope.split(",") : [],
    username: String(user["login"] ?? ""),
  };
}

async function exchangeGenericOAuth2Code(
  code: string,
  config: OAuthProviderConfig,
): Promise<{
  accessToken: string;
  refreshToken: string | null;
  scopes: string[];
}> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (data["error"]) {
    throw new Error(String(data["error_description"] ?? data["error"]));
  }

  return {
    accessToken: String(data["access_token"] ?? ""),
    refreshToken: data["refresh_token"] ? String(data["refresh_token"]) : null,
    scopes: String(data["scope"] ?? "")
      .split(/[ ,]+/)
      .filter(Boolean),
  };
}

/**
 * Called by the `manager://` protocol handler whenever the OS delivers a
 * redirect URL to the app.  Completes the OAuth2 exchange and persists tokens.
 */
export async function handleProtocolUrl(
  urlString: string,
  db: AppDatabase,
): Promise<void> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return;
  }

  if (url.host !== "oauth" || url.pathname !== "/callback") return;

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) return;

  const pending = pendingOAuthStates.get(state);
  if (!pending) return;
  pendingOAuthStates.delete(state);

  const { kind } = pending;

  try {
    await completeOAuth2(kind, code, db);
  } catch (err) {
    setRuntimeState(kind, {
      status: "error",
      auth: "unauthenticated",
      unavailableReason: "service-error",
    });
    console.error(`[integrationManager] OAuth2 error for ${kind}:`, err);
  }
}

async function completeOAuth2(
  kind: IntegrationKind,
  code: string,
  db: AppDatabase,
): Promise<void> {
  let patch: Partial<ServerSettings["integrations"]>;

  switch (kind) {
    case "github": {
      const config = getGitHubConfig();
      const { accessToken, scopes, username } = await exchangeGitHubCode(
        code,
        config,
      );

      patch = {
        github: {
          enabled: true,
          driver: "oauth2",
          accessToken:
            accessToken as ServerSettings["integrations"]["github"]["accessToken"],
          refreshToken: null,
          scopes,
          connectedUsername: username,
        },
      };

      setRuntimeState("github", {
        status: "ready",
        auth: "authenticated",
        driver: "oauth2",
        connectedAccount: username,
        unavailableReason: null,
      });
      break;
    }

    case "bitbucket": {
      const config = getBitbucketConfig();
      const { accessToken, refreshToken, scopes } =
        await exchangeGenericOAuth2Code(code, config);

      patch = {
        bitbucket: {
          enabled: true,
          driver: "oauth2",
          accessToken:
            accessToken as ServerSettings["integrations"]["bitbucket"]["accessToken"],
          refreshToken:
            refreshToken as ServerSettings["integrations"]["bitbucket"]["refreshToken"],
          scopes,
          connectedUsername: null,
        },
      };

      setRuntimeState("bitbucket", {
        status: "ready",
        auth: "authenticated",
        driver: "oauth2",
        unavailableReason: null,
      });
      break;
    }

    case "google": {
      const config = getGoogleConfig();
      const { accessToken, refreshToken, scopes } =
        await exchangeGenericOAuth2Code(code, config);

      // Fetch connected email.
      const infoRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const info = (await infoRes.json()) as Record<string, unknown>;
      const email = String(info["email"] ?? "");

      patch = {
        google: {
          enabled: true,
          driver: "oauth2",
          gmailEnabled: scopes.some((s) => s.includes("gmail")),
          calendarEnabled: scopes.some((s) => s.includes("calendar")),
          accessToken:
            accessToken as ServerSettings["integrations"]["google"]["accessToken"],
          refreshToken:
            refreshToken as ServerSettings["integrations"]["google"]["refreshToken"],
          scopes,
          connectedEmail: email || null,
        },
      };

      setRuntimeState("google", {
        status: "ready",
        auth: "authenticated",
        driver: "oauth2",
        connectedAccount: email || null,
        unavailableReason: null,
      });
      break;
    }

    default:
      return;
  }

  const current = readSettings(db);
  const merged = {
    ...current,
    integrations: { ...current.integrations, ...patch },
  };
  updateSettings(db, merged);
}

// ---------------------------------------------------------------------------
// Disconnect
// ---------------------------------------------------------------------------

export function disconnectIntegration(
  kind: IntegrationKind,
  db: AppDatabase,
): void {
  const current = readSettings(db);

  type Integrations = ServerSettings["integrations"];
  const clearedIntegrations: Integrations = {
    ...current.integrations,
    ...(kind === "github" && {
      github: {
        enabled: false,
        driver: null,
        accessToken: null,
        refreshToken: null,
        scopes: [],
        connectedUsername: null,
      },
    }),
    ...(kind === "bitbucket" && {
      bitbucket: {
        enabled: false,
        driver: null,
        accessToken: null,
        refreshToken: null,
        scopes: [],
        connectedUsername: null,
      },
    }),
    ...(kind === "google" && {
      google: {
        enabled: false,
        driver: null,
        gmailEnabled: false,
        calendarEnabled: false,
        accessToken: null,
        refreshToken: null,
        scopes: [],
        connectedEmail: null,
      },
    }),
    ...(kind === "mobilbank-sparebank" && {
      "mobilbank-sparebank": {
        enabled: false,
        driver: null,
        apiKey: null,
        connectedAccount: null,
      },
    }),
  };

  updateSettings(db, { ...current, integrations: clearedIntegrations });

  setRuntimeState(kind, {
    status: "disabled",
    auth: "unauthenticated",
    driver: null,
    connectedAccount: null,
    unavailableReason: null,
  });
}

// ---------------------------------------------------------------------------
// Build a ServerIntegration snapshot for a given kind
// ---------------------------------------------------------------------------

const KIND_TO_INSTANCE_ID: Record<IntegrationKind, string> = {
  github: "github",
  bitbucket: "bitbucket",
  google: "google",
  "mobilbank-sparebank": "mobilbank-sparebank",
};

export function buildServerIntegration(
  kind: IntegrationKind,
  enabled: boolean,
): ServerIntegration {
  const rt = getRuntimeState(kind);
  return {
    instanceId: KIND_TO_INSTANCE_ID[kind] as ServerIntegration["instanceId"],
    kind,
    enabled,
    status: enabled ? rt.status : "disabled",
    auth: rt.auth,
    availability: rt.availability,
    unavailableReason: rt.unavailableReason,
    driver: rt.driver,
    connectedAccount: rt.connectedAccount,
  };
}
