import { Effect, Schema } from "effect";
import { OAuthAccessToken, OAuthRefreshToken } from "./integrationInstance.ts";

export type IntegrationSettingsOrder<Fields extends Schema.Struct.Fields> =
  readonly Extract<keyof Fields, string>[];

export function makeIntegrationSettingsSchema<
  const Fields extends Schema.Struct.Fields,
>(
  fields: Fields,
  options?: {
    readonly order?: IntegrationSettingsOrder<Fields> | undefined;
  },
): Schema.Struct<Fields> {
  return Schema.Struct(fields).pipe(
    Schema.annotate({
      providerSettingsFormSchema:
        options?.order === undefined ? undefined : { order: options.order },
    }),
  );
}

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------

export const GitHubIntegrationSettings = makeIntegrationSettingsSchema(
  {
    enabled: Schema.Boolean,
    /**
     * Auth method the user has chosen.
     * `null` = not yet configured.
     */
    driver: Schema.NullOr(Schema.Literals(["oauth2", "personal-access-token"])),
    accessToken: Schema.NullOr(OAuthAccessToken),
    refreshToken: Schema.NullOr(OAuthRefreshToken),
    /** Space-separated OAuth scopes that were granted. */
    scopes: Schema.Array(Schema.String),
    connectedUsername: Schema.NullOr(Schema.String),
  },
  { order: ["enabled", "driver", "connectedUsername"] },
);
export type GitHubIntegrationSettings = typeof GitHubIntegrationSettings.Type;

// ---------------------------------------------------------------------------
// Bitbucket
// ---------------------------------------------------------------------------

export const BitbucketIntegrationSettings = makeIntegrationSettingsSchema(
  {
    enabled: Schema.Boolean,
    driver: Schema.NullOr(Schema.Literals(["oauth2", "app-password"])),
    accessToken: Schema.NullOr(OAuthAccessToken),
    refreshToken: Schema.NullOr(OAuthRefreshToken),
    scopes: Schema.Array(Schema.String),
    connectedUsername: Schema.NullOr(Schema.String),
  },
  { order: ["enabled", "driver", "connectedUsername"] },
);
export type BitbucketIntegrationSettings =
  typeof BitbucketIntegrationSettings.Type;

// ---------------------------------------------------------------------------
// Google  (Gmail + Calendar combined under a single OAuth grant)
// ---------------------------------------------------------------------------

export const GoogleIntegrationSettings = makeIntegrationSettingsSchema(
  {
    enabled: Schema.Boolean,
    driver: Schema.NullOr(Schema.Literal("oauth2")),
    /** Whether the Gmail scope is included in the OAuth grant. */
    gmailEnabled: Schema.Boolean,
    /** Whether the Calendar scope is included in the OAuth grant. */
    calendarEnabled: Schema.Boolean,
    accessToken: Schema.NullOr(OAuthAccessToken),
    refreshToken: Schema.NullOr(OAuthRefreshToken),
    scopes: Schema.Array(Schema.String),
    connectedEmail: Schema.NullOr(Schema.String),
  },
  { order: ["enabled", "gmailEnabled", "calendarEnabled", "connectedEmail"] },
);
export type GoogleIntegrationSettings = typeof GoogleIntegrationSettings.Type;

// ---------------------------------------------------------------------------
// Mobilbank Sparebank  (Open Banking / direct API key)
// ---------------------------------------------------------------------------

export const MobilbankSparebankIntegrationSettings =
  makeIntegrationSettingsSchema(
    {
      enabled: Schema.Boolean,
      driver: Schema.NullOr(Schema.Literal("open-banking")),
      /** API key issued by Sparebank 1 Open Banking. */
      apiKey: Schema.NullOr(Schema.String),
      /** Display label for the connected account (e.g. account number). */
      connectedAccount: Schema.NullOr(Schema.String),
    },
    { order: ["enabled", "driver", "connectedAccount"] },
  );
export type MobilbankSparebankIntegrationSettings =
  typeof MobilbankSparebankIntegrationSettings.Type;

// ---------------------------------------------------------------------------
// Server-side settings (stored in SQLite, synced to renderer via IPC)
// ---------------------------------------------------------------------------

export const ServerSettingsSchema = Schema.Struct({
  integrations: Schema.Struct({
    github: GitHubIntegrationSettings.pipe(
      Schema.withDecodingDefault(
        Effect.succeed({
          enabled: false,
          driver: null,
          accessToken: null,
          refreshToken: null,
          scopes: [],
          connectedUsername: null,
        }),
      ),
    ),
    bitbucket: BitbucketIntegrationSettings.pipe(
      Schema.withDecodingDefault(
        Effect.succeed({
          enabled: false,
          driver: null,
          accessToken: null,
          refreshToken: null,
          scopes: [],
          connectedUsername: null,
        }),
      ),
    ),
    google: GoogleIntegrationSettings.pipe(
      Schema.withDecodingDefault(
        Effect.succeed({
          enabled: false,
          driver: null,
          gmailEnabled: false,
          calendarEnabled: false,
          accessToken: null,
          refreshToken: null,
          scopes: [],
          connectedEmail: null,
        }),
      ),
    ),
    "mobilbank-sparebank": MobilbankSparebankIntegrationSettings.pipe(
      Schema.withDecodingDefault(
        Effect.succeed({
          enabled: false,
          driver: null,
          apiKey: null,
          connectedAccount: null,
        }),
      ),
    ),
  }),
});
export type ServerSettings = typeof ServerSettingsSchema.Type;

/** Factory default — used as the initial atom value and for "Restore defaults". */
export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  integrations: {
    github: {
      enabled: false,
      driver: null,
      accessToken: null,
      refreshToken: null,
      scopes: [],
      connectedUsername: null,
    },
    bitbucket: {
      enabled: false,
      driver: null,
      accessToken: null,
      refreshToken: null,
      scopes: [],
      connectedUsername: null,
    },
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
    "mobilbank-sparebank": {
      enabled: false,
      driver: null,
      apiKey: null,
      connectedAccount: null,
    },
  },
};

// ---------------------------------------------------------------------------
// Client-side settings (stored in localStorage, never sent to the server)
// ---------------------------------------------------------------------------

export const ClientSettingsSchema = Schema.Struct({});
export type ClientSettings = typeof ClientSettingsSchema.Type;

export const DEFAULT_CLIENT_SETTINGS: ClientSettings = {};

// ---------------------------------------------------------------------------
// Unified view (merged in the renderer)
// ---------------------------------------------------------------------------

export type UnifiedSettings = ServerSettings & ClientSettings;
