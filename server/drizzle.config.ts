import { loadConfigurations, configuration } from '@/config';
import { type Config } from 'drizzle-kit';

loadConfigurations();

const PostgresConfig = {
  host: configuration.required.POSTGRES_HOST ?? 'localhost',
  port: parseInt(configuration.required.POSTGRES_PORT ?? '5432') || 5432,
  username: configuration.required.POSTGRES_USER ?? 'postgres',
  password: configuration.required.POSTGRES_PASSWORD ?? 'password',
  database: configuration.required.POSTGRES_DB ?? 'postgres',
};

// eslint-disable-next-line import/no-default-export -- default export is required by Drizzle
export default {
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${PostgresConfig.username}:${PostgresConfig.password}@${
      PostgresConfig.host
    }:${PostgresConfig.port.toString()}/${PostgresConfig.database}`,
  },
  verbose: true,
  strict: true,
} satisfies Config;
