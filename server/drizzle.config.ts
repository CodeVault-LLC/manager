import { type Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const PostgresConfig = {
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: parseInt(process.env.POSTGRES_PORT ?? "5432") || 5432,
  username: process.env.POSTGRES_USER ?? "postgres",
  password: process.env.POSTGRES_PASSWORD ?? "password",
  database: process.env.POSTGRES_DB ?? "postgres",
};

// eslint-disable-next-line import/no-default-export -- default export is required by Drizzle
export default {
  schema: "./src/models/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgresql://${PostgresConfig.username}:${PostgresConfig.password}@${
      PostgresConfig.host
    }:${PostgresConfig.port.toString()}/${PostgresConfig.database}`,
  },
  verbose: true,
  strict: true,
} satisfies Config;
