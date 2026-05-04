import { Effect, Schema } from "effect";

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

export const GithubSettings = makeIntegrationSettingsSchema({
  enabled: Schema.Boolean,
});
export type GithubSettings = typeof GithubSettings.Type;

export const ServerSettingsSchema = Schema.Struct({
  integrations: Schema.Struct({
    github: GithubSettings.pipe(
      Schema.withDecodingDefault(Effect.succeed({ enabled: false })),
    ),
  }),
});
export type ServerSettings = typeof ServerSettingsSchema.Type;

export const ClientSettingsSchema = Schema.Struct({});
export type ClientSettings = typeof ClientSettingsSchema.Type;

export type UnifiedSettings = ServerSettings & ClientSettings;
