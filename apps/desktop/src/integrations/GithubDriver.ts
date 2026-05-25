import crypto from "node:crypto";
import { shell } from "electron";
import type { ConnectIntegrationResult } from "@manager/contracts";
import type { GithubScope } from "@manager/contracts";
import type { ServerSettings } from "@manager/contracts/settings";
import type { AppDatabase } from "../database.ts";
import { readSettings, updateSettings } from "../settingsService.ts";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

export interface GithubDriverCompleteResult {
  connectedAccount: string | null;
}

export class GithubDriver {
  private readonly redirectUri: string;
  private readonly defaultScopes: string[];
  private readonly pendingStates = new Set<string>();

  constructor(options?: { redirectUri?: string; defaultScopes?: string[] }) {
    this.redirectUri = options?.redirectUri ?? "manager://oauth/callback";
    this.defaultScopes = options?.defaultScopes ?? ["read:user", "repo"];
  }

  async startFlow(): Promise<ConnectIntegrationResult> {
    const credentials = this.getCredentials();
    if (!credentials.ok) {
      return { success: false, error: credentials.error };
    }

    const state = crypto.randomBytes(16).toString("hex");
    this.pendingStates.add(state);

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: this.redirectUri,
      scope: this.defaultScopes.join(" "),
      state,
      response_type: "code",
    });

    try {
      await shell.openExternal(`${GITHUB_AUTHORIZE_URL}?${params.toString()}`);
      return { success: true, status: "started" };
    } catch {
      this.pendingStates.delete(state);
      return {
        success: false,
        error: "Failed to open the GitHub authorization page.",
      };
    }
  }

  canHandleCallback(callbackUrl: string): boolean {
    let url: URL;
    try {
      url = new URL(callbackUrl);
    } catch {
      return false;
    }

    if (url.protocol !== "manager:" || url.host !== "oauth") return false;
    if (url.pathname !== "/callback") return false;

    const state = url.searchParams.get("state");
    return state !== null && this.pendingStates.has(state);
  }

  async completeFlow(
    callbackUrl: string,
    db: AppDatabase,
  ): Promise<GithubDriverCompleteResult> {
    const credentials = this.getCredentials();
    if (!credentials.ok) {
      throw new Error(credentials.error);
    }

    const callback = this.parseCallback(callbackUrl);
    this.pendingStates.delete(callback.state);

    const token = await this.exchangeCode(callback.code, credentials);
    const username = await this.fetchUsername(token.accessToken);

    const current = readSettings(db);
    updateSettings(db, {
      ...current,
      integrations: {
        ...current.integrations,
        github: {
          enabled: true,
          driver: "oauth2",
          accessToken:
            token.accessToken as ServerSettings["integrations"]["github"]["accessToken"],
          refreshToken: null,
          scopes: token.scopes,
          connectedUsername: username,
        },
      },
    });
    return { connectedAccount: username };
  }

  private parseCallback(callbackUrl: string): { code: string; state: string } {
    let url: URL;
    try {
      url = new URL(callbackUrl);
    } catch {
      throw new Error("Invalid OAuth callback URL.");
    }

    if (url.protocol !== "manager:" || url.host !== "oauth") {
      throw new Error("Unsupported OAuth callback scheme.");
    }
    if (url.pathname !== "/callback") {
      throw new Error("Unsupported OAuth callback path.");
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      throw new Error("OAuth callback is missing required query parameters.");
    }
    if (!this.pendingStates.has(state)) {
      throw new Error("Unknown or expired OAuth state.");
    }

    return { code, state };
  }

  private async exchangeCode(
    code: string,
    credentials: { ok: true; clientId: string; clientSecret: string },
  ): Promise<{ accessToken: string; scopes: GithubScope[] }> {
    const response = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok || payload["error"]) {
      throw new Error(String(payload["error_description"] ?? payload["error"]));
    }

    const accessToken = String(payload["access_token"] ?? "").trim();
    if (!accessToken) {
      throw new Error(
        "GitHub OAuth token exchange did not return an access token.",
      );
    }

    const scopes = String(payload["scope"] ?? "")
      .split(/[ ,]+/)
      .filter(Boolean) as GithubScope[];

    return { accessToken, scopes };
  }

  private async fetchUsername(accessToken: string): Promise<string | null> {
    const response = await fetch(GITHUB_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch GitHub user profile.");
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const username = String(payload["login"] ?? "").trim();
    return username || null;
  }

  private getCredentials():
    | { ok: true; clientId: string; clientSecret: string }
    | { ok: false; error: string } {
    const clientId = process.env["GITHUB_CLIENT_ID"]?.trim() ?? "";
    const clientSecret = process.env["GITHUB_CLIENT_SECRET"]?.trim() ?? "";

    if (!clientId && !clientSecret) {
      return {
        ok: false,
        error:
          "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your desktop environment before starting the app.",
      };
    }

    if (!clientId) {
      return {
        ok: false,
        error:
          "GITHUB_CLIENT_ID is missing. Set it before starting the desktop app.",
      };
    }

    if (!clientSecret) {
      return {
        ok: false,
        error:
          "GITHUB_CLIENT_SECRET is missing. Set it before starting the desktop app.",
      };
    }

    return { ok: true, clientId, clientSecret };
  }
}
