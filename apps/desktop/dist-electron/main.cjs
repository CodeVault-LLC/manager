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
TrimmedNonEmptyString.check(effect.Schema.isMaxLength(64), effect.Schema.isPattern(/^[a-zA-Z][a-zA-Z0-9_-]*$/)).pipe(effect.Schema.brand("IntegrationInstanceId"));
effect.Schema.Literals([
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
	scopes: effect.Schema.Array(effect.Schema.String),
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
var settingsService_exports = /* @__PURE__ */ __exportAll({
	readSettings: () => readSettings,
	resetSettings: () => resetSettings,
	updateSettings: () => updateSettings
});
const SETTINGS_KEY = "server_settings";
function readRaw(db) {
	const row = db.select({ value: settings.value }).from(settings).where((0, drizzle_orm.eq)(settings.key, SETTINGS_KEY)).get();
	if (!row) return void 0;
	try {
		return JSON.parse(row.value);
	} catch {
		return;
	}
}
function writeRaw(db, value) {
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
	const raw = readRaw(db);
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
	writeRaw(db, effect.Schema.encodeSync(ServerSettingsSchema)(updated));
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
//#region src/integrationManager.ts
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
const runtimeState = /* @__PURE__ */ new Map();
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
	const current = getRuntimeState(kind);
	runtimeState.set(kind, {
		...current,
		...patch
	});
}
const pendingOAuthStates = /* @__PURE__ */ new Map();
function generateState() {
	return node_crypto.default.randomBytes(16).toString("hex");
}
function getGitHubConfig() {
	return {
		authorizeUrl: "https://github.com/login/oauth/authorize",
		tokenUrl: "https://github.com/login/oauth/access_token",
		clientId: process.env["GITHUB_CLIENT_ID"] ?? "",
		clientSecret: process.env["GITHUB_CLIENT_SECRET"] ?? "",
		defaultScopes: ["read:user", "repo"],
		driver: "oauth2"
	};
}
function getBitbucketConfig() {
	return {
		authorizeUrl: "https://bitbucket.org/site/oauth2/authorize",
		tokenUrl: "https://bitbucket.org/site/oauth2/access_token",
		clientId: process.env["BITBUCKET_CLIENT_ID"] ?? "",
		clientSecret: process.env["BITBUCKET_CLIENT_SECRET"] ?? "",
		defaultScopes: ["account", "repository"],
		driver: "oauth2"
	};
}
function getGoogleConfig() {
	return {
		authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
		tokenUrl: "https://oauth2.googleapis.com/token",
		clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
		clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
		defaultScopes: [
			"openid",
			"email",
			"https://www.googleapis.com/auth/gmail.readonly",
			"https://www.googleapis.com/auth/calendar.readonly"
		],
		driver: "oauth2"
	};
}
const REDIRECT_URI = "manager://oauth/callback";
async function startOAuth2Flow(kind, config) {
	if (!config.clientId) return {
		success: false,
		error: `${kind} OAuth2 client ID is not configured. Set the environment variable and rebuild.`
	};
	const state = generateState();
	pendingOAuthStates.set(state, { kind });
	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: REDIRECT_URI,
		scope: config.defaultScopes.join(" "),
		state,
		response_type: "code"
	});
	const authUrl = `${config.authorizeUrl}?${params.toString()}`;
	await electron.shell.openExternal(authUrl);
	return { success: true };
}
async function connectIntegration(kind, db) {
	switch (kind) {
		case "github": return startOAuth2Flow(kind, getGitHubConfig());
		case "bitbucket": return startOAuth2Flow(kind, getBitbucketConfig());
		case "google": return startOAuth2Flow(kind, getGoogleConfig());
		case "mobilbank-sparebank": return connectMobilbank(db);
		default: return {
			success: false,
			error: `Unknown integration kind: ${String(kind)}`
		};
	}
}
async function connectMobilbank(db) {
	const apiKey = (await Promise.resolve().then(() => settingsService_exports)).readSettings(db).integrations["mobilbank-sparebank"].apiKey;
	if (!apiKey) return {
		success: false,
		error: "No API key configured. Enter your Sparebank Open Banking key in the integration settings."
	};
	setRuntimeState("mobilbank-sparebank", {
		status: "ready",
		auth: "authenticated",
		availability: "unknown",
		driver: "open-banking",
		connectedAccount: "Account ending …" + apiKey.slice(-4)
	});
	return { success: true };
}
async function exchangeGitHubCode(code, config) {
	const data = await (await fetch(config.tokenUrl, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			client_id: config.clientId,
			client_secret: config.clientSecret,
			code,
			redirect_uri: REDIRECT_URI
		})
	})).json();
	if (data["error"]) throw new Error(String(data["error_description"] ?? data["error"]));
	const accessToken = String(data["access_token"] ?? "");
	const scope = String(data["scope"] ?? "");
	const user = await (await fetch("https://api.github.com/user", { headers: {
		Authorization: `Bearer ${accessToken}`,
		Accept: "application/vnd.github+json"
	} })).json();
	return {
		accessToken,
		scopes: scope ? scope.split(",") : [],
		username: String(user["login"] ?? "")
	};
}
async function exchangeGenericOAuth2Code(code, config) {
	const body = new URLSearchParams({
		client_id: config.clientId,
		client_secret: config.clientSecret,
		code,
		redirect_uri: REDIRECT_URI,
		grant_type: "authorization_code"
	});
	const data = await (await fetch(config.tokenUrl, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body.toString()
	})).json();
	if (data["error"]) throw new Error(String(data["error_description"] ?? data["error"]));
	return {
		accessToken: String(data["access_token"] ?? ""),
		refreshToken: data["refresh_token"] ? String(data["refresh_token"]) : null,
		scopes: String(data["scope"] ?? "").split(/[ ,]+/).filter(Boolean)
	};
}
/**
* Called by the `manager://` protocol handler whenever the OS delivers a
* redirect URL to the app.  Completes the OAuth2 exchange and persists tokens.
*/
async function handleProtocolUrl(urlString, db) {
	let url;
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
			unavailableReason: "service-error"
		});
		console.error(`[integrationManager] OAuth2 error for ${kind}:`, err);
	}
}
async function completeOAuth2(kind, code, db) {
	let patch;
	switch (kind) {
		case "github": {
			const { accessToken, scopes, username } = await exchangeGitHubCode(code, getGitHubConfig());
			patch = { github: {
				enabled: true,
				driver: "oauth2",
				accessToken,
				refreshToken: null,
				scopes,
				connectedUsername: username
			} };
			setRuntimeState("github", {
				status: "ready",
				auth: "authenticated",
				driver: "oauth2",
				connectedAccount: username,
				unavailableReason: null
			});
			break;
		}
		case "bitbucket": {
			const { accessToken, refreshToken, scopes } = await exchangeGenericOAuth2Code(code, getBitbucketConfig());
			patch = { bitbucket: {
				enabled: true,
				driver: "oauth2",
				accessToken,
				refreshToken,
				scopes,
				connectedUsername: null
			} };
			setRuntimeState("bitbucket", {
				status: "ready",
				auth: "authenticated",
				driver: "oauth2",
				unavailableReason: null
			});
			break;
		}
		case "google": {
			const { accessToken, refreshToken, scopes } = await exchangeGenericOAuth2Code(code, getGoogleConfig());
			const info = await (await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${accessToken}` } })).json();
			const email = String(info["email"] ?? "");
			patch = { google: {
				enabled: true,
				driver: "oauth2",
				gmailEnabled: scopes.some((s) => s.includes("gmail")),
				calendarEnabled: scopes.some((s) => s.includes("calendar")),
				accessToken,
				refreshToken,
				scopes,
				connectedEmail: email || null
			} };
			setRuntimeState("google", {
				status: "ready",
				auth: "authenticated",
				driver: "oauth2",
				connectedAccount: email || null,
				unavailableReason: null
			});
			break;
		}
		default: return;
	}
	const current = readSettings(db);
	updateSettings(db, {
		...current,
		integrations: {
			...current.integrations,
			...patch
		}
	});
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
		unavailableReason: null
	});
}
const KIND_TO_INSTANCE_ID = {
	github: "github",
	bitbucket: "bitbucket",
	google: "google",
	"mobilbank-sparebank": "mobilbank-sparebank"
};
function buildServerIntegration(kind, enabled) {
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
function buildServerConfig() {
	const settings = readSettings(getDatabase());
	return {
		settings,
		integrations: Object.fromEntries([
			"github",
			"bitbucket",
			"google",
			"mobilbank-sparebank"
		].map((kind) => {
			return [kind, buildServerIntegration(kind, kind === "github" ? settings.integrations.github.enabled : kind === "bitbucket" ? settings.integrations.bitbucket.enabled : kind === "google" ? settings.integrations.google.enabled : settings.integrations["mobilbank-sparebank"].enabled)];
		}))
	};
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
		return connectIntegration(kind, getDatabase());
	});
	electron_main.ipcMain.handle(DISCONNECT_INTEGRATION_CHANNEL, (_, kind) => {
		disconnectIntegration(kind, getDatabase());
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
	getDatabase();
	electron.protocol.handle("manager", (request) => {
		handleProtocolUrl(request.url, getDatabase());
		return new Response(null, { status: 204 });
	});
	registerIpcHandlers();
	createWindow();
});
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("before-quit", () => {
	closeDatabase();
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion

//# sourceMappingURL=main.cjs.map