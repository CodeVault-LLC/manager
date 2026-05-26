import crypto from "node:crypto";
import type { ConnectIntegrationResult } from "@manager/contracts";
import type { DeviantArtScope } from "@manager/contracts";
import type { ServerSettings } from "@manager/contracts/settings";
import type { AppDatabase } from "../../database.ts";
import { readSettings, updateSettings } from "../../settingsService.ts";

const DEVIANTART_AUTHORIZE_URL = "https://www.deviantart.com/oauth2/authorize";
const DEVIANTART_TOKEN_URL = "https://www.deviantart.com/oauth2/token";
const DEVIANTART_WHOAMI_URL =
  "https://www.deviantart.com/api/v1/oauth2/user/whoami";

export interface DeviantArtDriverCompleteResult {
  connectedAccount: string | null;
}

export class DeviantArtDriver {
  private readonly redirectUri: string;
  private readonly defaultScopes: string[];
  private readonly pendingFlows = new Map<string, { codeVerifier: string }>();

  constructor(options?: { redirectUri?: string; defaultScopes?: string[] }) {
    this.redirectUri = options?.redirectUri ?? "manager://oauth/callback";
    this.defaultScopes = options?.defaultScopes ?? ["browse", "user"];
  }

  async startFlow(): Promise<ConnectIntegrationResult> {
    const credentials = this.getCredentials();
    if (!credentials.ok) {
      return { success: false, error: credentials.error };
    }

    const state = crypto.randomBytes(16).toString("hex");
    const codeVerifier = this.createCodeVerifier();
    const codeChallenge = this.createCodeChallenge(codeVerifier);
    this.pendingFlows.set(state, { codeVerifier });

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: this.redirectUri,
      scope: this.defaultScopes.join(" "),
      state,
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return {
      success: true,
      status: "started",
      authUrl: `${DEVIANTART_AUTHORIZE_URL}?${params.toString()}`,
    };
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
    return state !== null && this.pendingFlows.has(state);
  }

  cancelFlowByAuthUrl(authUrl: string): void {
    try {
      const url = new URL(authUrl);
      const state = url.searchParams.get("state");
      if (state) this.pendingFlows.delete(state);
    } catch {
      // Ignore malformed URLs; launch failed path will surface an error.
    }
  }

  async completeFlow(
    callbackUrl: string,
    db: AppDatabase,
  ): Promise<DeviantArtDriverCompleteResult> {
    const credentials = this.getCredentials();
    if (!credentials.ok) {
      throw new Error(credentials.error);
    }

    const callback = this.parseCallback(callbackUrl);
    const flow = this.pendingFlows.get(callback.state);
    if (!flow) {
      throw new Error("Unknown or expired OAuth state.");
    }
    this.pendingFlows.delete(callback.state);

    const token = await this.exchangeCode(
      callback.code,
      credentials,
      flow.codeVerifier,
    );
    const username = await this.fetchUsername(token.accessToken);

    const current = readSettings(db);
    updateSettings(db, {
      ...current,
      integrations: {
        ...current.integrations,
        deviantart: {
          enabled: true,
          driver: "oauth2",
          accessToken:
            token.accessToken as ServerSettings["integrations"]["deviantart"]["accessToken"],
          refreshToken:
            (token.refreshToken as ServerSettings["integrations"]["deviantart"]["refreshToken"]) ??
            null,
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

    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      const description =
        url.searchParams.get("error_description") ??
        "OAuth authorization failed.";
      throw new Error(`DeviantArt OAuth error: ${description}`);
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      throw new Error("OAuth callback is missing required query parameters.");
    }
    if (!this.pendingFlows.has(state)) {
      throw new Error("Unknown or expired OAuth state.");
    }

    return { code, state };
  }

  private async exchangeCode(
    code: string,
    credentials: { ok: true; clientId: string; clientSecret: string },
    codeVerifier: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string | null;
    scopes: DeviantArtScope[];
  }> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(DEVIANTART_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok || payload["error"]) {
      throw new Error(String(payload["error_description"] ?? payload["error"]));
    }

    const accessToken = String(payload["access_token"] ?? "").trim();
    if (!accessToken) {
      throw new Error(
        "DeviantArt OAuth token exchange did not return an access token.",
      );
    }

    const refreshToken = String(payload["refresh_token"] ?? "").trim() || null;
    const scopes = String(payload["scope"] ?? "")
      .split(/[ ,]+/)
      .filter(Boolean) as DeviantArtScope[];

    return { accessToken, refreshToken, scopes };
  }

  private createCodeVerifier(): string {
    return this.base64UrlEncode(crypto.randomBytes(64));
  }

  private createCodeChallenge(codeVerifier: string): string {
    const digest = crypto.createHash("sha256").update(codeVerifier).digest();
    return this.base64UrlEncode(digest);
  }

  private base64UrlEncode(input: Buffer): string {
    return input
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  private async fetchUsername(accessToken: string): Promise<string | null> {
    const response = await fetch(DEVIANTART_WHOAMI_URL, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch DeviantArt user profile.");
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const username = String(
      payload["username"] ?? payload["userid"] ?? "",
    ).trim();
    return username || null;
  }

  private getCredentials():
    | { ok: true; clientId: string; clientSecret: string }
    | { ok: false; error: string } {
    const clientId = process.env["DEVIANTART_CLIENT_ID"]?.trim() ?? "";
    const clientSecret = process.env["DEVIANTART_CLIENT_SECRET"]?.trim() ?? "";

    if (!clientId && !clientSecret) {
      return {
        ok: false,
        error:
          "DeviantArt OAuth is not configured. Set DEVIANTART_CLIENT_ID and DEVIANTART_CLIENT_SECRET in your desktop environment before starting the app.",
      };
    }

    if (!clientId) {
      return {
        ok: false,
        error:
          "DEVIANTART_CLIENT_ID is missing. Set it before starting the desktop app.",
      };
    }

    if (!clientSecret) {
      return {
        ok: false,
        error:
          "DEVIANTART_CLIENT_SECRET is missing. Set it before starting the desktop app.",
      };
    }

    return { ok: true, clientId, clientSecret };
  }
}
