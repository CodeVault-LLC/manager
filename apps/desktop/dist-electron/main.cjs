//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let node_path = require("node:path");
node_path = __toESM(node_path, 1);
let node_fs = require("node:fs");
node_fs = __toESM(node_fs, 1);
let electron_main = require("electron/main");
let better_sqlite3 = require("better-sqlite3");
better_sqlite3 = __toESM(better_sqlite3, 1);
let drizzle_orm_better_sqlite3 = require("drizzle-orm/better-sqlite3");
let drizzle_orm_better_sqlite3_migrator = require("drizzle-orm/better-sqlite3/migrator");
let drizzle_orm = require("drizzle-orm");
let drizzle_orm_sqlite_core = require("drizzle-orm/sqlite-core");
let effect = require("effect");
let node_crypto = require("node:crypto");
node_crypto = __toESM(node_crypto, 1);
//#region src/updateChannels.ts
const NIGHTLY_VERSION_PATTERN = /-nightly\.\d{8}\.\d+$/;
function isNightlyDesktopVersion(version) {
	return NIGHTLY_VERSION_PATTERN.test(version);
}
//#endregion
//#region src/appBranding.ts
const APP_BASE_NAME = "Manager";
function resolveDesktopAppStageLabel(input) {
	if (input.isDevelopment) return "Dev";
	return isNightlyDesktopVersion(input.appVersion) ? "Nightly" : "Alpha";
}
function resolveDesktopAppBranding(input) {
	const stageLabel = resolveDesktopAppStageLabel(input);
	return {
		baseName: APP_BASE_NAME,
		stageLabel,
		displayName: `${APP_BASE_NAME} (${stageLabel})`
	};
}
//#endregion
//#region src/db/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({
	integrationCredentials: () => integrationCredentials,
	integrationState: () => integrationState,
	settings: () => settings
});
const settings = (0, drizzle_orm_sqlite_core.sqliteTable)("settings", {
	key: (0, drizzle_orm_sqlite_core.text)("key").primaryKey().notNull(),
	value: (0, drizzle_orm_sqlite_core.text)("value").notNull()
});
const integrationCredentials = (0, drizzle_orm_sqlite_core.sqliteTable)("integration_credentials", {
	kind: (0, drizzle_orm_sqlite_core.text)("kind").primaryKey().notNull(),
	accessToken: (0, drizzle_orm_sqlite_core.text)("access_token"),
	refreshToken: (0, drizzle_orm_sqlite_core.text)("refresh_token"),
	tokenExpiresAt: (0, drizzle_orm_sqlite_core.integer)("token_expires_at"),
	scopes: (0, drizzle_orm_sqlite_core.text)("scopes").notNull().default("[]"),
	connectedAccount: (0, drizzle_orm_sqlite_core.text)("connected_account"),
	updatedAt: (0, drizzle_orm_sqlite_core.integer)("updated_at").notNull().default(drizzle_orm.sql`(unixepoch())`)
});
const integrationState = (0, drizzle_orm_sqlite_core.sqliteTable)("integration_state", {
	kind: (0, drizzle_orm_sqlite_core.text)("kind").primaryKey().notNull(),
	availability: (0, drizzle_orm_sqlite_core.text)("availability").notNull().default("unknown"),
	unavailableReason: (0, drizzle_orm_sqlite_core.text)("unavailable_reason"),
	driver: (0, drizzle_orm_sqlite_core.text)("driver"),
	lastCheckedAt: (0, drizzle_orm_sqlite_core.integer)("last_checked_at")
});
//#endregion
//#region src/database.ts
let _sqlite = null;
let _db = null;
function getDatabase() {
	if (_db) return _db;
	_sqlite = new better_sqlite3.default(node_path.join(electron.app.getPath("userData"), "manager.db"));
	_sqlite.pragma("journal_mode = WAL");
	_sqlite.pragma("foreign_keys = ON");
	_db = (0, drizzle_orm_better_sqlite3.drizzle)(_sqlite, { schema: schema_exports });
	const migrationsFolder = Boolean(process.env.VITE_DEV_SERVER_URL) ? node_path.join(__dirname, "../src/db/migrations") : node_path.join(__dirname, "migrations");
	(0, drizzle_orm_better_sqlite3_migrator.migrate)(_db, { migrationsFolder });
	return _db;
}
function closeDatabase() {
	_sqlite?.close();
	_sqlite = null;
	_db = null;
}
const TrimmedNonEmptyString = effect.Schema.Trim.check(effect.Schema.isNonEmpty());
/**
* `IntegrationInstanceId` — user-defined routing key for a configured provider
* instance. Same slug rules as `ProviderDriverKind`; branded separately so the
* type system cannot confuse the two.
*/
const IntegrationInstanceId = TrimmedNonEmptyString.check(effect.Schema.isMaxLength(64), effect.Schema.isPattern(/^[a-zA-Z][a-zA-Z0-9_-]*$/)).pipe(effect.Schema.brand("IntegrationInstanceId"));
/**
* `IntegrationKind` — identifies one of the supported integration providers.
* Branded so the type system distinguishes it from arbitrary strings.
*/
const IntegrationKind = effect.Schema.Literals([
	"github",
	"bitbucket",
	"google",
	"mobilbank-sparebank"
]);
/** Branded OAuth access token — non-empty trimmed string. */
const OAuthAccessToken = TrimmedNonEmptyString.pipe(effect.Schema.brand("OAuthAccessToken"));
/** Branded OAuth refresh token — non-empty trimmed string. */
const OAuthRefreshToken = TrimmedNonEmptyString.pipe(effect.Schema.brand("OAuthRefreshToken"));
TrimmedNonEmptyString.pipe(effect.Schema.brand("OAuthClientId"));
effect.Schema.Literals([
	"read:user",
	"user:email",
	"repo",
	"repo:status",
	"public_repo",
	"repo:invite",
	"security_events",
	"notifications"
]);
const GithubScope = effect.Schema.String;
const GithubScopeList = effect.Schema.Array(GithubScope);
const GithubNotificationSubject = effect.Schema.Struct({
	title: effect.Schema.String,
	type: effect.Schema.String,
	url: effect.Schema.NullOr(effect.Schema.String),
	latestCommentUrl: effect.Schema.NullOr(effect.Schema.String)
});
const GithubNotificationRepository = effect.Schema.Struct({
	fullName: effect.Schema.String,
	htmlUrl: effect.Schema.String
});
const GithubNotificationItem = effect.Schema.Struct({
	id: effect.Schema.String,
	unread: effect.Schema.Boolean,
	reason: effect.Schema.String,
	updatedAt: effect.Schema.String,
	lastReadAt: effect.Schema.NullOr(effect.Schema.String),
	webUrl: effect.Schema.NullOr(effect.Schema.String),
	subject: GithubNotificationSubject,
	repository: GithubNotificationRepository
});
const GithubNotificationsState = effect.Schema.Struct({
	items: effect.Schema.Array(GithubNotificationItem),
	etag: effect.Schema.NullOr(effect.Schema.String),
	pollIntervalSeconds: effect.Schema.Number,
	lastCheckedAt: effect.Schema.NullOr(effect.Schema.String)
});
const DEFAULT_GITHUB_NOTIFICATIONS_STATE = {
	items: [],
	etag: null,
	pollIntervalSeconds: 60,
	lastCheckedAt: null
};
//#endregion
//#region ../../packages/contracts/src/settings.ts
function makeIntegrationSettingsSchema(fields, options) {
	return effect.Schema.Struct(fields).pipe(effect.Schema.annotate({ providerSettingsFormSchema: options?.order === void 0 ? void 0 : { order: options.order } }));
}
const GitHubIntegrationSettings = makeIntegrationSettingsSchema({
	enabled: effect.Schema.Boolean,
	/**
	* Auth method the user has chosen.
	* `null` = not yet configured.
	*/
	driver: effect.Schema.NullOr(effect.Schema.Literals(["oauth2", "personal-access-token"])),
	accessToken: effect.Schema.NullOr(OAuthAccessToken),
	refreshToken: effect.Schema.NullOr(OAuthRefreshToken),
	/** Space-separated OAuth scopes that were granted. */
	scopes: GithubScopeList,
	connectedUsername: effect.Schema.NullOr(effect.Schema.String)
}, { order: [
	"enabled",
	"driver",
	"connectedUsername"
] });
const BitbucketIntegrationSettings = makeIntegrationSettingsSchema({
	enabled: effect.Schema.Boolean,
	driver: effect.Schema.NullOr(effect.Schema.Literals(["oauth2", "app-password"])),
	accessToken: effect.Schema.NullOr(OAuthAccessToken),
	refreshToken: effect.Schema.NullOr(OAuthRefreshToken),
	scopes: effect.Schema.Array(effect.Schema.String),
	connectedUsername: effect.Schema.NullOr(effect.Schema.String)
}, { order: [
	"enabled",
	"driver",
	"connectedUsername"
] });
const GoogleIntegrationSettings = makeIntegrationSettingsSchema({
	enabled: effect.Schema.Boolean,
	driver: effect.Schema.NullOr(effect.Schema.Literal("oauth2")),
	/** Whether the Gmail scope is included in the OAuth grant. */
	gmailEnabled: effect.Schema.Boolean,
	/** Whether the Calendar scope is included in the OAuth grant. */
	calendarEnabled: effect.Schema.Boolean,
	accessToken: effect.Schema.NullOr(OAuthAccessToken),
	refreshToken: effect.Schema.NullOr(OAuthRefreshToken),
	scopes: effect.Schema.Array(effect.Schema.String),
	connectedEmail: effect.Schema.NullOr(effect.Schema.String)
}, { order: [
	"enabled",
	"gmailEnabled",
	"calendarEnabled",
	"connectedEmail"
] });
const MobilbankSparebankIntegrationSettings = makeIntegrationSettingsSchema({
	enabled: effect.Schema.Boolean,
	driver: effect.Schema.NullOr(effect.Schema.Literal("open-banking")),
	/** API key issued by Sparebank 1 Open Banking. */
	apiKey: effect.Schema.NullOr(effect.Schema.String),
	/** Display label for the connected account (e.g. account number). */
	connectedAccount: effect.Schema.NullOr(effect.Schema.String)
}, { order: [
	"enabled",
	"driver",
	"connectedAccount"
] });
const ServerSettingsSchema = effect.Schema.Struct({ integrations: effect.Schema.Struct({
	github: GitHubIntegrationSettings.pipe(effect.Schema.withDecodingDefault(effect.Effect.succeed({
		enabled: false,
		driver: null,
		accessToken: null,
		refreshToken: null,
		scopes: [],
		connectedUsername: null
	}))),
	bitbucket: BitbucketIntegrationSettings.pipe(effect.Schema.withDecodingDefault(effect.Effect.succeed({
		enabled: false,
		driver: null,
		accessToken: null,
		refreshToken: null,
		scopes: [],
		connectedUsername: null
	}))),
	google: GoogleIntegrationSettings.pipe(effect.Schema.withDecodingDefault(effect.Effect.succeed({
		enabled: false,
		driver: null,
		gmailEnabled: false,
		calendarEnabled: false,
		accessToken: null,
		refreshToken: null,
		scopes: [],
		connectedEmail: null
	}))),
	"mobilbank-sparebank": MobilbankSparebankIntegrationSettings.pipe(effect.Schema.withDecodingDefault(effect.Effect.succeed({
		enabled: false,
		driver: null,
		apiKey: null,
		connectedAccount: null
	})))
}) });
/** Factory default — used as the initial atom value and for "Restore defaults". */
const DEFAULT_SERVER_SETTINGS = { integrations: {
	github: {
		enabled: false,
		driver: null,
		accessToken: null,
		refreshToken: null,
		scopes: [],
		connectedUsername: null
	},
	bitbucket: {
		enabled: false,
		driver: null,
		accessToken: null,
		refreshToken: null,
		scopes: [],
		connectedUsername: null
	},
	google: {
		enabled: false,
		driver: null,
		gmailEnabled: false,
		calendarEnabled: false,
		accessToken: null,
		refreshToken: null,
		scopes: [],
		connectedEmail: null
	},
	"mobilbank-sparebank": {
		enabled: false,
		driver: null,
		apiKey: null,
		connectedAccount: null
	}
} };
effect.Schema.Struct({});
//#endregion
//#region src/settingsService.ts
/**
* Settings service — reads and writes `ServerSettings` in the SQLite database.
*
* All settings are stored as a single JSON blob under the key `"server_settings"`.
* Credentials (OAuth tokens) are stored in the dedicated `integration_credentials`
* table so they can be managed independently.
*/
const SETTINGS_KEY = "server_settings";
function readRaw$1(db) {
	const row = db.select({ value: settings.value }).from(settings).where((0, drizzle_orm.eq)(settings.key, SETTINGS_KEY)).get();
	if (!row) return void 0;
	try {
		return JSON.parse(row.value);
	} catch {
		return;
	}
}
function writeRaw$1(db, value) {
	db.insert(settings).values({
		key: SETTINGS_KEY,
		value: JSON.stringify(value)
	}).onConflictDoUpdate({
		target: settings.key,
		set: { value: JSON.stringify(value) }
	}).run();
}
/**
* Read server settings from the database.  Falls back to factory defaults if
* nothing has been written yet or the stored data fails schema validation.
*/
function readSettings(db) {
	const raw = readRaw$1(db);
	if (raw === void 0) return DEFAULT_SERVER_SETTINGS;
	try {
		return effect.Schema.decodeUnknownSync(ServerSettingsSchema)(raw);
	} catch {
		return DEFAULT_SERVER_SETTINGS;
	}
}
/**
* Deep-merge `patch` over the current settings and persist the result.
* Returns the updated settings.
*/
function updateSettings(db, patch) {
	const current = readSettings(db);
	const updated = {
		...current,
		...patch,
		integrations: {
			...current.integrations,
			...patch.integrations ?? {},
			github: {
				...current.integrations.github,
				...patch.integrations?.github ?? {}
			},
			bitbucket: {
				...current.integrations.bitbucket,
				...patch.integrations?.bitbucket ?? {}
			},
			google: {
				...current.integrations.google,
				...patch.integrations?.google ?? {}
			},
			"mobilbank-sparebank": {
				...current.integrations["mobilbank-sparebank"],
				...patch.integrations?.["mobilbank-sparebank"] ?? {}
			}
		}
	};
	writeRaw$1(db, effect.Schema.encodeSync(ServerSettingsSchema)(updated));
	return updated;
}
/**
* Delete all stored settings and return the factory defaults.
*/
function resetSettings(db) {
	db.delete(settings).where((0, drizzle_orm.eq)(settings.key, SETTINGS_KEY)).run();
	return DEFAULT_SERVER_SETTINGS;
}
//#endregion
//#region src/integrations/GithubDriver.ts
const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
var GithubDriver = class {
	redirectUri;
	defaultScopes;
	pendingStates = /* @__PURE__ */ new Set();
	constructor(options) {
		this.redirectUri = options?.redirectUri ?? "manager://oauth/callback";
		this.defaultScopes = options?.defaultScopes ?? ["read:user", "repo"];
	}
	async startFlow() {
		const credentials = this.getCredentials();
		if (!credentials.ok) return {
			success: false,
			error: credentials.error
		};
		const state = node_crypto.default.randomBytes(16).toString("hex");
		this.pendingStates.add(state);
		const params = new URLSearchParams({
			client_id: credentials.clientId,
			redirect_uri: this.redirectUri,
			scope: this.defaultScopes.join(" "),
			state,
			response_type: "code"
		});
		try {
			await electron.shell.openExternal(`${GITHUB_AUTHORIZE_URL}?${params.toString()}`);
			return {
				success: true,
				status: "started"
			};
		} catch {
			this.pendingStates.delete(state);
			return {
				success: false,
				error: "Failed to open the GitHub authorization page."
			};
		}
	}
	canHandleCallback(callbackUrl) {
		let url;
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
	async completeFlow(callbackUrl, db) {
		const credentials = this.getCredentials();
		if (!credentials.ok) throw new Error(credentials.error);
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
					accessToken: token.accessToken,
					refreshToken: null,
					scopes: token.scopes,
					connectedUsername: username
				}
			}
		});
		return { connectedAccount: username };
	}
	parseCallback(callbackUrl) {
		let url;
		try {
			url = new URL(callbackUrl);
		} catch {
			throw new Error("Invalid OAuth callback URL.");
		}
		if (url.protocol !== "manager:" || url.host !== "oauth") throw new Error("Unsupported OAuth callback scheme.");
		if (url.pathname !== "/callback") throw new Error("Unsupported OAuth callback path.");
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		if (!code || !state) throw new Error("OAuth callback is missing required query parameters.");
		if (!this.pendingStates.has(state)) throw new Error("Unknown or expired OAuth state.");
		return {
			code,
			state
		};
	}
	async exchangeCode(code, credentials) {
		const response = await fetch(GITHUB_TOKEN_URL, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret,
				code,
				redirect_uri: this.redirectUri
			})
		});
		const payload = await response.json();
		if (!response.ok || payload["error"]) throw new Error(String(payload["error_description"] ?? payload["error"]));
		const accessToken = String(payload["access_token"] ?? "").trim();
		if (!accessToken) throw new Error("GitHub OAuth token exchange did not return an access token.");
		return {
			accessToken,
			scopes: String(payload["scope"] ?? "").split(/[ ,]+/).filter(Boolean)
		};
	}
	async fetchUsername(accessToken) {
		const response = await fetch(GITHUB_USER_URL, { headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/vnd.github+json"
		} });
		if (!response.ok) throw new Error("Unable to fetch GitHub user profile.");
		const payload = await response.json();
		return String(payload["login"] ?? "").trim() || null;
	}
	getCredentials() {
		const clientId = process.env["GITHUB_CLIENT_ID"]?.trim() ?? "";
		const clientSecret = process.env["GITHUB_CLIENT_SECRET"]?.trim() ?? "";
		if (!clientId && !clientSecret) return {
			ok: false,
			error: "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your desktop environment before starting the app."
		};
		if (!clientId) return {
			ok: false,
			error: "GITHUB_CLIENT_ID is missing. Set it before starting the desktop app."
		};
		if (!clientSecret) return {
			ok: false,
			error: "GITHUB_CLIENT_SECRET is missing. Set it before starting the desktop app."
		};
		return {
			ok: true,
			clientId,
			clientSecret
		};
	}
};
//#endregion
//#region ../../packages/contracts/src/server.ts
/**
* Provider-side health reported by the integration's own status API.
* - `available`  — operating normally
* - `degraded`   — partially impaired (e.g. slow responses, some features down)
* - `outage`     — full or major service outage
* - `unknown`    — status has not yet been fetched or is unavailable
*/
const IntegrationAvailability = effect.Schema.Literals([
	"available",
	"degraded",
	"outage",
	"unknown"
]);
/**
* Why the integration is currently unavailable from our side (not the
* provider's side — see `IntegrationAvailability` for that).
*/
const IntegrationUnavailableReason = effect.Schema.Literals([
	"rate-limited",
	"blocked",
	"credentials-expired",
	"service-error"
]);
/** Overall lifecycle state of an integration instance. */
const ServerIntegrationState = effect.Schema.Literals([
	"ready",
	"warning",
	"error",
	"disabled"
]);
/** Whether the integration has valid credentials on file. */
const ServerIntegrationAuthStatus = effect.Schema.Literals([
	"authenticated",
	"unauthenticated",
	"unknown"
]);
effect.Schema.Struct({
	/** Stable routing key for this instance (matches the settings key). */
	instanceId: IntegrationInstanceId,
	/** Which provider this instance belongs to. */
	kind: IntegrationKind,
	/** Whether the integration is switched on by the user. */
	enabled: effect.Schema.Boolean,
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
	unavailableReason: effect.Schema.NullOr(IntegrationUnavailableReason),
	/**
	* Identifier for the active auth/connection driver, e.g. `"oauth2"` or
	* `"personal-access-token"`. `null` before first connect.
	*/
	driver: effect.Schema.NullOr(effect.Schema.String),
	/**
	* Display name / identifier for the connected account (username, email …).
	* `null` before first connect.
	*/
	connectedAccount: effect.Schema.NullOr(effect.Schema.String)
});
//#endregion
//#region src/integrations/githubNotificationsStore.ts
const GITHUB_NOTIFICATIONS_KEY = "github_notifications_state";
function readRaw(db) {
	const row = db.select({ value: settings.value }).from(settings).where((0, drizzle_orm.eq)(settings.key, GITHUB_NOTIFICATIONS_KEY)).get();
	if (!row) return void 0;
	try {
		return JSON.parse(row.value);
	} catch {
		return;
	}
}
function writeRaw(db, value) {
	db.insert(settings).values({
		key: GITHUB_NOTIFICATIONS_KEY,
		value: JSON.stringify(value)
	}).onConflictDoUpdate({
		target: settings.key,
		set: { value: JSON.stringify(value) }
	}).run();
}
function readGithubNotificationsState(db) {
	const raw = readRaw(db);
	if (raw === void 0) return DEFAULT_GITHUB_NOTIFICATIONS_STATE;
	try {
		return effect.Schema.decodeUnknownSync(GithubNotificationsState)(raw);
	} catch {
		return DEFAULT_GITHUB_NOTIFICATIONS_STATE;
	}
}
function writeGithubNotificationsState(db, state) {
	writeRaw(db, effect.Schema.encodeSync(GithubNotificationsState)(state));
	return state;
}
//#endregion
//#region src/integrations/githubNotificationsPoller.ts
const GITHUB_NOTIFICATIONS_URL = "https://api.github.com/notifications";
const FALLBACK_POLL_INTERVAL_SECONDS = 60;
const MIN_POLL_INTERVAL_SECONDS = 15;
const MAX_STORED_NOTIFICATIONS = 50;
function resolvePollInterval(value) {
	const parsed = Number.parseInt(value ?? "", 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return FALLBACK_POLL_INTERVAL_SECONDS;
	return Math.max(MIN_POLL_INTERVAL_SECONDS, parsed);
}
function mapSubject(raw) {
	return {
		title: String(raw["title"] ?? "Untitled notification"),
		type: String(raw["type"] ?? "Notification"),
		url: raw["url"] ? String(raw["url"]) : null,
		latestCommentUrl: raw["latest_comment_url"] ? String(raw["latest_comment_url"]) : null
	};
}
function mapRepository(raw) {
	return {
		fullName: String(raw["full_name"] ?? "unknown/unknown"),
		htmlUrl: String(raw["html_url"] ?? "https://github.com")
	};
}
function resolveWebUrl(subjectUrl, repositoryHtmlUrl) {
	if (!subjectUrl) return null;
	const issueMatch = subjectUrl.match(/^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/issues\/(\d+)$/);
	if (issueMatch) {
		const [, owner, repo, number] = issueMatch;
		return `https://github.com/${owner}/${repo}/issues/${number}`;
	}
	const pullMatch = subjectUrl.match(/^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/pulls\/(\d+)$/);
	if (pullMatch) {
		const [, owner, repo, number] = pullMatch;
		return `https://github.com/${owner}/${repo}/pull/${number}`;
	}
	const commitMatch = subjectUrl.match(/^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/commits\/([a-f0-9]+)$/i);
	if (commitMatch) {
		const [, owner, repo, sha] = commitMatch;
		return `https://github.com/${owner}/${repo}/commit/${sha}`;
	}
	return repositoryHtmlUrl;
}
function mapNotification(raw) {
	const subjectRaw = typeof raw["subject"] === "object" && raw["subject"] !== null ? raw["subject"] : {};
	const repositoryRaw = typeof raw["repository"] === "object" && raw["repository"] !== null ? raw["repository"] : {};
	const subject = mapSubject(subjectRaw);
	const repository = mapRepository(repositoryRaw);
	return {
		id: String(raw["id"] ?? node_crypto.default.randomUUID()),
		unread: Boolean(raw["unread"]),
		reason: String(raw["reason"] ?? "subscribed"),
		updatedAt: String(raw["updated_at"] ?? (/* @__PURE__ */ new Date()).toISOString()),
		lastReadAt: raw["last_read_at"] ? String(raw["last_read_at"]) : null,
		webUrl: resolveWebUrl(subject.url, repository.htmlUrl),
		subject,
		repository
	};
}
async function pollGithubNotifications(db) {
	const github = readSettings(db).integrations.github;
	if (!github.enabled || !github.accessToken) return FALLBACK_POLL_INTERVAL_SECONDS;
	const cached = readGithubNotificationsState(db);
	let response;
	try {
		response = await fetch(GITHUB_NOTIFICATIONS_URL, { headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${github.accessToken}`,
			"X-GitHub-Api-Version": "2022-11-28",
			...cached.etag ? { "If-None-Match": cached.etag } : {}
		} });
	} catch (error) {
		console.warn("[github-notifications] poll request failed", { error });
		return Math.max(MIN_POLL_INTERVAL_SECONDS, cached.pollIntervalSeconds || FALLBACK_POLL_INTERVAL_SECONDS);
	}
	const pollIntervalSeconds = resolvePollInterval(response.headers.get("X-Poll-Interval"));
	const checkedAt = (/* @__PURE__ */ new Date()).toISOString();
	if (response.status === 304) {
		const state304 = {
			...cached,
			pollIntervalSeconds,
			lastCheckedAt: checkedAt,
			etag: response.headers.get("ETag") ?? cached.etag
		};
		writeGithubNotificationsState(db, state304);
		console.info("[github-notifications] polled", {
			status: 304,
			pollIntervalSeconds,
			etag: state304.etag,
			itemCount: state304.items.length
		});
		return pollIntervalSeconds;
	}
	if (!response.ok) {
		console.warn("[github-notifications] poll failed", {
			status: response.status,
			pollIntervalSeconds
		});
		return pollIntervalSeconds;
	}
	const payload = await response.json();
	const nextState = {
		items: (Array.isArray(payload) ? payload : []).filter((item) => typeof item === "object" && item !== null).map((item) => mapNotification(item)).slice(0, MAX_STORED_NOTIFICATIONS),
		etag: response.headers.get("ETag") ?? cached.etag,
		pollIntervalSeconds,
		lastCheckedAt: checkedAt
	};
	writeGithubNotificationsState(db, nextState);
	console.info("[github-notifications] polled", {
		status: response.status,
		pollIntervalSeconds,
		etag: nextState.etag,
		itemCount: nextState.items.length,
		sample: nextState.items.slice(0, 5).map((item) => ({
			id: item.id,
			reason: item.reason,
			title: item.subject.title,
			repository: item.repository.fullName,
			webUrl: item.webUrl,
			updatedAt: item.updatedAt
		}))
	});
	return pollIntervalSeconds;
}
function clearGithubNotificationsCache$1(db) {
	writeGithubNotificationsState(db, DEFAULT_GITHUB_NOTIFICATIONS_STATE);
}
//#endregion
//#region src/integrations/index.ts
const runtimeState = /* @__PURE__ */ new Map();
const githubDriver = new GithubDriver();
function getDefaultRuntimeState() {
	return {
		availability: "unknown",
		unavailableReason: null,
		driver: null,
		connectedAccount: null,
		status: "disabled",
		auth: "unauthenticated"
	};
}
function getRuntimeState(kind) {
	return runtimeState.get(kind) ?? getDefaultRuntimeState();
}
function setRuntimeState(kind, patch) {
	runtimeState.set(kind, {
		...getRuntimeState(kind),
		...patch
	});
}
function hydrateRuntimeState(kind, settings) {
	if (runtimeState.has(kind)) return;
	switch (kind) {
		case "github": {
			const integration = settings.integrations.github;
			const isAuthenticated = Boolean(integration.enabled) && Boolean(integration.accessToken);
			setRuntimeState("github", {
				availability: "unknown",
				unavailableReason: null,
				driver: integration.driver,
				connectedAccount: integration.connectedUsername,
				status: integration.enabled ? isAuthenticated ? "ready" : "warning" : "disabled",
				auth: isAuthenticated ? "authenticated" : "unauthenticated"
			});
			return;
		}
		case "bitbucket": {
			const integration = settings.integrations.bitbucket;
			const isAuthenticated = Boolean(integration.enabled) && Boolean(integration.accessToken);
			setRuntimeState("bitbucket", {
				availability: "unknown",
				unavailableReason: null,
				driver: integration.driver,
				connectedAccount: integration.connectedUsername,
				status: integration.enabled ? isAuthenticated ? "ready" : "warning" : "disabled",
				auth: isAuthenticated ? "authenticated" : "unauthenticated"
			});
			return;
		}
		case "google": {
			const integration = settings.integrations.google;
			const isAuthenticated = Boolean(integration.enabled) && Boolean(integration.accessToken);
			setRuntimeState("google", {
				availability: "unknown",
				unavailableReason: null,
				driver: integration.driver,
				connectedAccount: integration.connectedEmail,
				status: integration.enabled ? isAuthenticated ? "ready" : "warning" : "disabled",
				auth: isAuthenticated ? "authenticated" : "unauthenticated"
			});
			return;
		}
		case "mobilbank-sparebank": {
			const integration = settings.integrations["mobilbank-sparebank"];
			const isAuthenticated = Boolean(integration.enabled) && Boolean(integration.apiKey);
			setRuntimeState("mobilbank-sparebank", {
				availability: "unknown",
				unavailableReason: null,
				driver: integration.driver,
				connectedAccount: integration.connectedAccount,
				status: integration.enabled ? isAuthenticated ? "ready" : "warning" : "disabled",
				auth: isAuthenticated ? "authenticated" : "unauthenticated"
			});
			return;
		}
		default: return;
	}
}
const KIND_TO_INSTANCE_ID = {
	github: "github",
	bitbucket: "bitbucket",
	google: "google",
	"mobilbank-sparebank": "mobilbank-sparebank"
};
function buildServerIntegration(kind, settings) {
	hydrateRuntimeState(kind, settings);
	const enabled = kind === "github" ? settings.integrations.github.enabled : kind === "bitbucket" ? settings.integrations.bitbucket.enabled : kind === "google" ? settings.integrations.google.enabled : settings.integrations["mobilbank-sparebank"].enabled;
	const rt = getRuntimeState(kind);
	return {
		instanceId: KIND_TO_INSTANCE_ID[kind],
		kind,
		enabled,
		status: enabled ? rt.status : "disabled",
		auth: rt.auth,
		availability: rt.availability,
		unavailableReason: rt.unavailableReason,
		driver: rt.driver,
		connectedAccount: rt.connectedAccount
	};
}
async function connectMobilbank(db) {
	const apiKey = readSettings(db).integrations["mobilbank-sparebank"].apiKey;
	if (!apiKey) return {
		success: false,
		error: "No API key configured. Enter your Sparebank Open Banking key in the integration settings."
	};
	setRuntimeState("mobilbank-sparebank", {
		status: "ready",
		auth: "authenticated",
		availability: "unknown",
		driver: "open-banking",
		connectedAccount: "Account ending ..." + apiKey.slice(-4),
		unavailableReason: null
	});
	return { success: true };
}
async function connectIntegration(kind, db) {
	switch (kind) {
		case "github": {
			const result = await githubDriver.startFlow();
			if (result.success) setRuntimeState("github", {
				status: "warning",
				auth: "unauthenticated",
				availability: "unknown",
				unavailableReason: null,
				driver: "oauth2",
				connectedAccount: null
			});
			return result;
		}
		case "mobilbank-sparebank": {
			const result = await connectMobilbank(db);
			return result.success ? {
				...result,
				status: "completed"
			} : result;
		}
		case "bitbucket":
		case "google": return {
			success: false,
			error: `${kind} OAuth driver is not implemented yet.`
		};
		default: return {
			success: false,
			error: `Unknown integration kind: ${String(kind)}`
		};
	}
}
async function handleProtocolUrl(urlString, db) {
	if (!githubDriver.canHandleCallback(urlString)) return;
	try {
		setRuntimeState("github", {
			status: "ready",
			auth: "authenticated",
			availability: "unknown",
			unavailableReason: null,
			driver: "oauth2",
			connectedAccount: (await githubDriver.completeFlow(urlString, db)).connectedAccount
		});
	} catch (error) {
		setRuntimeState("github", {
			status: "error",
			auth: "unauthenticated",
			unavailableReason: "service-error",
			connectedAccount: null,
			driver: "oauth2"
		});
		console.error("[integrations] GitHub OAuth2 callback failed:", error);
	}
}
function disconnectIntegration(kind, db) {
	const current = readSettings(db);
	const clearedIntegrations = {
		...current.integrations,
		...kind === "github" && { github: {
			enabled: false,
			driver: null,
			accessToken: null,
			refreshToken: null,
			scopes: [],
			connectedUsername: null
		} },
		...kind === "bitbucket" && { bitbucket: {
			enabled: false,
			driver: null,
			accessToken: null,
			refreshToken: null,
			scopes: [],
			connectedUsername: null
		} },
		...kind === "google" && { google: {
			enabled: false,
			driver: null,
			gmailEnabled: false,
			calendarEnabled: false,
			accessToken: null,
			refreshToken: null,
			scopes: [],
			connectedEmail: null
		} },
		...kind === "mobilbank-sparebank" && { "mobilbank-sparebank": {
			enabled: false,
			driver: null,
			apiKey: null,
			connectedAccount: null
		} }
	};
	updateSettings(db, {
		...current,
		integrations: clearedIntegrations
	});
	setRuntimeState(kind, {
		status: "disabled",
		auth: "unauthenticated",
		driver: null,
		connectedAccount: null,
		unavailableReason: null,
		availability: "unknown"
	});
}
function clearGithubNotificationsCache(db) {
	clearGithubNotificationsCache$1(db);
}
//#endregion
//#region src/main.ts
electron.protocol.registerSchemesAsPrivileged([{
	scheme: "manager",
	privileges: {
		standard: true,
		secure: false
	}
}]);
const ROOT_DIR = node_path.resolve(__dirname, "../../..");
const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);
const TITLEBAR_HEIGHT = 40;
const TITLEBAR_COLOR = "#01000000";
const TITLEBAR_LIGHT_SYMBOL_COLOR = "#1f2937";
const TITLEBAR_DARK_SYMBOL_COLOR = "#f8fafc";
const desktopAppBranding = resolveDesktopAppBranding({
	isDevelopment,
	appVersion: electron.app.getVersion()
});
const APP_DISPLAY_NAME = desktopAppBranding.displayName;
let mainWindow = null;
let isQuitting = false;
let pendingProtocolUrl = null;
let githubNotificationsPollTimeout = null;
function getInitialWindowBackgroundColor() {
	return electron.nativeTheme.shouldUseDarkColors ? "#0a0a0a" : "#ffffff";
}
function resolveResourcePath(fileName) {
	const candidates = [
		node_path.join(__dirname, "../resources", fileName),
		node_path.join(__dirname, "../prod-resources", fileName),
		node_path.join(process.resourcesPath, "resources", fileName),
		node_path.join(process.resourcesPath, fileName)
	];
	for (const candidate of candidates) if (node_fs.existsSync(candidate)) return candidate;
	return null;
}
function resolveIconPath(ext) {
	if (isDevelopment && process.platform === "darwin" && ext === "png") {
		const developmentDockIconPath = node_path.join(ROOT_DIR, "assets", "dev", "blueprint-macos-1024.png");
		if (node_fs.existsSync(developmentDockIconPath)) return developmentDockIconPath;
	}
	return resolveResourcePath(`icon.${ext}`);
}
function getIconOption() {
	if (process.platform === "darwin") return {};
	const iconPath = resolveIconPath(process.platform === "win32" ? "ico" : "png");
	return iconPath ? { icon: iconPath } : {};
}
function getWindowTitleBarOptions() {
	if (process.platform === "darwin") return {
		titleBarStyle: "hiddenInset",
		trafficLightPosition: {
			x: 16,
			y: 18
		}
	};
	return {
		titleBarStyle: "hidden",
		titleBarOverlay: {
			color: TITLEBAR_COLOR,
			height: TITLEBAR_HEIGHT,
			symbolColor: electron.nativeTheme.shouldUseDarkColors ? TITLEBAR_DARK_SYMBOL_COLOR : TITLEBAR_LIGHT_SYMBOL_COLOR
		}
	};
}
const GET_APP_BRANDING_CHANNEL = "desktop:get-app-branding";
const GET_SERVER_CONFIG_CHANNEL = "desktop:get-server-config";
const UPDATE_SETTINGS_CHANNEL = "desktop:update-settings";
const RESET_SETTINGS_CHANNEL = "desktop:reset-settings";
const CONNECT_INTEGRATION_CHANNEL = "desktop:connect-integration";
const DISCONNECT_INTEGRATION_CHANNEL = "desktop:disconnect-integration";
function extractProtocolUrl(argv) {
	for (const arg of argv) if (arg.startsWith("manager://")) return arg;
	return null;
}
function handleIncomingProtocolUrl(url) {
	pendingProtocolUrl = url;
	if (!electron.app.isReady()) return;
	handleProtocolUrl(url, getDatabase());
	pendingProtocolUrl = null;
}
function registerProtocolClient() {
	if (process.defaultApp) {
		const entryPoint = process.argv[1];
		if (!entryPoint) {
			console.warn("[oauth] Unable to register manager:// protocol in development (missing entry point).");
			return;
		}
		electron.app.setAsDefaultProtocolClient("manager", process.execPath, [entryPoint]);
		return;
	}
	electron.app.setAsDefaultProtocolClient("manager");
}
const gotSingleInstanceLock = electron.app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) electron.app.quit();
if (gotSingleInstanceLock) {
	electron.app.on("second-instance", (_event, argv) => {
		const protocolUrl = extractProtocolUrl(argv);
		if (protocolUrl) handleIncomingProtocolUrl(protocolUrl);
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});
	electron.app.on("open-url", (event, url) => {
		event.preventDefault();
		handleIncomingProtocolUrl(url);
	});
}
const launchProtocolUrl = extractProtocolUrl(process.argv);
if (launchProtocolUrl) pendingProtocolUrl = launchProtocolUrl;
function buildServerConfig() {
	const db = getDatabase();
	const settings = readSettings(db);
	return {
		settings,
		githubNotifications: readGithubNotificationsState(db),
		integrations: Object.fromEntries([
			"github",
			"bitbucket",
			"google",
			"mobilbank-sparebank"
		].map((kind) => {
			return [kind, buildServerIntegration(kind, settings)];
		}))
	};
}
function scheduleGithubNotificationsPoll(delayMs) {
	if (githubNotificationsPollTimeout) {
		clearTimeout(githubNotificationsPollTimeout);
		githubNotificationsPollTimeout = null;
	}
	githubNotificationsPollTimeout = setTimeout(() => {
		runGithubNotificationsPoll();
	}, delayMs);
}
async function runGithubNotificationsPoll() {
	const nextPollIntervalSeconds = await pollGithubNotifications(getDatabase());
	if (!isQuitting) scheduleGithubNotificationsPoll(nextPollIntervalSeconds * 1e3);
}
function registerIpcHandlers() {
	electron_main.ipcMain.removeAllListeners(GET_APP_BRANDING_CHANNEL);
	electron_main.ipcMain.removeAllListeners(GET_SERVER_CONFIG_CHANNEL);
	electron_main.ipcMain.removeAllListeners(UPDATE_SETTINGS_CHANNEL);
	electron_main.ipcMain.removeAllListeners(RESET_SETTINGS_CHANNEL);
	electron_main.ipcMain.removeAllListeners(CONNECT_INTEGRATION_CHANNEL);
	electron_main.ipcMain.removeAllListeners(DISCONNECT_INTEGRATION_CHANNEL);
	electron_main.ipcMain.on(GET_APP_BRANDING_CHANNEL, (event) => {
		event.returnValue = desktopAppBranding;
	});
	electron_main.ipcMain.handle(GET_SERVER_CONFIG_CHANNEL, () => buildServerConfig());
	electron_main.ipcMain.handle(UPDATE_SETTINGS_CHANNEL, (_, patch) => {
		updateSettings(getDatabase(), patch);
		return buildServerConfig();
	});
	electron_main.ipcMain.handle(RESET_SETTINGS_CHANNEL, () => {
		resetSettings(getDatabase());
		return buildServerConfig();
	});
	electron_main.ipcMain.handle(CONNECT_INTEGRATION_CHANNEL, async (_, kind) => {
		const result = await connectIntegration(kind, getDatabase());
		if (kind === "github") scheduleGithubNotificationsPoll(500);
		return result;
	});
	electron_main.ipcMain.handle(DISCONNECT_INTEGRATION_CHANNEL, (_, kind) => {
		const db = getDatabase();
		disconnectIntegration(kind, db);
		if (kind === "github") {
			clearGithubNotificationsCache(db);
			scheduleGithubNotificationsPoll(6e4);
		}
		return buildServerConfig();
	});
}
function createWindow() {
	mainWindow = new electron.BrowserWindow({
		width: 1100,
		height: 780,
		minWidth: 840,
		minHeight: 620,
		show: false,
		autoHideMenuBar: true,
		backgroundColor: getInitialWindowBackgroundColor(),
		...getIconOption(),
		title: APP_DISPLAY_NAME,
		...getWindowTitleBarOptions(),
		webPreferences: {
			preload: node_path.join(__dirname, "preload.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true
		}
	});
	const appUrl = isDevelopment ? process.env.VITE_DEV_SERVER_URL : "http://127.0.0.1:3000";
	mainWindow.loadURL(appUrl?.toString() ?? "http://127.0.0.1:3000");
	if (isDevelopment) mainWindow.webContents.openDevTools({ mode: "detach" });
	mainWindow.once("ready-to-show", () => {
		if (!mainWindow) return;
		mainWindow.show();
	});
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		electron.shell.openExternal(url);
		return { action: "deny" };
	});
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}
electron.app.whenReady().then(() => {
	registerProtocolClient();
	getDatabase();
	electron.protocol.handle("manager", (request) => {
		handleProtocolUrl(request.url, getDatabase());
		return new Response(null, { status: 204 });
	});
	if (pendingProtocolUrl) handleIncomingProtocolUrl(pendingProtocolUrl);
	registerIpcHandlers();
	createWindow();
	scheduleGithubNotificationsPoll(2e3);
});
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("before-quit", () => {
	isQuitting = true;
	if (githubNotificationsPollTimeout) {
		clearTimeout(githubNotificationsPollTimeout);
		githubNotificationsPollTimeout = null;
	}
	closeDatabase();
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion

//# sourceMappingURL=main.cjs.map