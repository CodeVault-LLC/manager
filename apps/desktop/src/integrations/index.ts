import type { IntegrationKind, ServerIntegration } from "@manager/contracts";
import type { ConnectIntegrationResult } from "@manager/contracts";
import type { ServerSettings } from "@manager/contracts/settings";
import type { AppDatabase } from "../database.ts";
import { readSettings, updateSettings } from "../settingsService.ts";
import { GithubDriver } from "./GithubDriver.ts";
import { clearGithubNotificationsCache as clearGithubNotificationsCacheStore } from "./githubNotificationsPoller.ts";

type RuntimeState = {
  availability: ServerIntegration["availability"];
  unavailableReason: ServerIntegration["unavailableReason"];
  driver: ServerIntegration["driver"];
  connectedAccount: ServerIntegration["connectedAccount"];
  status: ServerIntegration["status"];
  auth: ServerIntegration["auth"];
};

const runtimeState = new Map<IntegrationKind, RuntimeState>();

const githubDriver = new GithubDriver();

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

function getRuntimeState(kind: IntegrationKind): RuntimeState {
  return runtimeState.get(kind) ?? getDefaultRuntimeState();
}

function setRuntimeState(
  kind: IntegrationKind,
  patch: Partial<RuntimeState>,
): void {
  runtimeState.set(kind, { ...getRuntimeState(kind), ...patch });
}

function hydrateRuntimeState(
  kind: IntegrationKind,
  settings: ServerSettings,
): void {
  if (runtimeState.has(kind)) return;

  switch (kind) {
    case "github": {
      const integration = settings.integrations.github;
      const isAuthenticated =
        Boolean(integration.enabled) && Boolean(integration.accessToken);
      setRuntimeState("github", {
        availability: "unknown",
        unavailableReason: null,
        driver: integration.driver,
        connectedAccount: integration.connectedUsername,
        status: integration.enabled
          ? isAuthenticated
            ? "ready"
            : "warning"
          : "disabled",
        auth: isAuthenticated ? "authenticated" : "unauthenticated",
      });
      return;
    }
    case "bitbucket": {
      const integration = settings.integrations.bitbucket;
      const isAuthenticated =
        Boolean(integration.enabled) && Boolean(integration.accessToken);
      setRuntimeState("bitbucket", {
        availability: "unknown",
        unavailableReason: null,
        driver: integration.driver,
        connectedAccount: integration.connectedUsername,
        status: integration.enabled
          ? isAuthenticated
            ? "ready"
            : "warning"
          : "disabled",
        auth: isAuthenticated ? "authenticated" : "unauthenticated",
      });
      return;
    }
    case "google": {
      const integration = settings.integrations.google;
      const isAuthenticated =
        Boolean(integration.enabled) && Boolean(integration.accessToken);
      setRuntimeState("google", {
        availability: "unknown",
        unavailableReason: null,
        driver: integration.driver,
        connectedAccount: integration.connectedEmail,
        status: integration.enabled
          ? isAuthenticated
            ? "ready"
            : "warning"
          : "disabled",
        auth: isAuthenticated ? "authenticated" : "unauthenticated",
      });
      return;
    }
    case "mobilbank-sparebank": {
      const integration = settings.integrations["mobilbank-sparebank"];
      const isAuthenticated =
        Boolean(integration.enabled) && Boolean(integration.apiKey);
      setRuntimeState("mobilbank-sparebank", {
        availability: "unknown",
        unavailableReason: null,
        driver: integration.driver,
        connectedAccount: integration.connectedAccount,
        status: integration.enabled
          ? isAuthenticated
            ? "ready"
            : "warning"
          : "disabled",
        auth: isAuthenticated ? "authenticated" : "unauthenticated",
      });
      return;
    }
    default:
      return;
  }
}

const KIND_TO_INSTANCE_ID: Record<IntegrationKind, string> = {
  github: "github",
  bitbucket: "bitbucket",
  google: "google",
  "mobilbank-sparebank": "mobilbank-sparebank",
};

export function buildServerIntegration(
  kind: IntegrationKind,
  settings: ServerSettings,
): ServerIntegration {
  hydrateRuntimeState(kind, settings);

  const enabled =
    kind === "github"
      ? settings.integrations.github.enabled
      : kind === "bitbucket"
        ? settings.integrations.bitbucket.enabled
        : kind === "google"
          ? settings.integrations.google.enabled
          : settings.integrations["mobilbank-sparebank"].enabled;

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

async function connectMobilbank(
  db: AppDatabase,
): Promise<ConnectIntegrationResult> {
  const apiKey = readSettings(db).integrations["mobilbank-sparebank"].apiKey;

  if (!apiKey) {
    return {
      success: false,
      error:
        "No API key configured. Enter your Sparebank Open Banking key in the integration settings.",
    };
  }

  setRuntimeState("mobilbank-sparebank", {
    status: "ready",
    auth: "authenticated",
    availability: "unknown",
    driver: "open-banking",
    connectedAccount: "Account ending ..." + apiKey.slice(-4),
    unavailableReason: null,
  });

  return { success: true };
}

export async function connectIntegration(
  kind: IntegrationKind,
  db: AppDatabase,
): Promise<ConnectIntegrationResult> {
  switch (kind) {
    case "github": {
      const result = await githubDriver.startFlow();
      if (result.success) {
        setRuntimeState("github", {
          status: "warning",
          auth: "unauthenticated",
          availability: "unknown",
          unavailableReason: null,
          driver: "oauth2",
          connectedAccount: null,
        });
      }
      return result;
    }
    case "mobilbank-sparebank": {
      const result = await connectMobilbank(db);
      return result.success ? { ...result, status: "completed" } : result;
    }
    case "bitbucket":
    case "google":
      return {
        success: false,
        error: `${kind} OAuth driver is not implemented yet.`,
      };
    default:
      return {
        success: false,
        error: `Unknown integration kind: ${String(kind)}`,
      };
  }
}

export async function handleProtocolUrl(
  urlString: string,
  db: AppDatabase,
): Promise<void> {
  if (!githubDriver.canHandleCallback(urlString)) {
    return;
  }

  try {
    const result = await githubDriver.completeFlow(urlString, db);
    setRuntimeState("github", {
      status: "ready",
      auth: "authenticated",
      availability: "unknown",
      unavailableReason: null,
      driver: "oauth2",
      connectedAccount: result.connectedAccount,
    });
  } catch (error) {
    setRuntimeState("github", {
      status: "error",
      auth: "unauthenticated",
      unavailableReason: "service-error",
      connectedAccount: null,
      driver: "oauth2",
    });
    console.error("[integrations] GitHub OAuth2 callback failed:", error);
  }
}

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
    availability: "unknown",
  });
}

export function clearGithubNotificationsCache(db: AppDatabase): void {
  clearGithubNotificationsCacheStore(db);
}
