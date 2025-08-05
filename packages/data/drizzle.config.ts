import type { Config } from "drizzle-kit";

export default {
  schema: "./src/models/schema.ts",
  out: "../../apps/desktop/migrations",
  dialect: "sqlite",
  migrations: {
    table: "journal",
    schema: "migrations",
  },
} satisfies Config;
