import { defineConfig } from "drizzle-kit";
import * as os from "node:os";
import * as Path from "node:path";

/**
 * drizzle.config.ts is used ONLY by the drizzle-kit CLI (db:generate, db:migrate, db:studio).
 * It must NOT import from Electron — drizzle-kit runs as a plain Node.js process.
 *
 * The database path mirrors what Electron's `app.getPath("userData")` returns on each OS:
 *   Linux:   ~/.config/Manager/manager.db
 *   macOS:   ~/Library/Application Support/Manager/manager.db
 *   Windows: %APPDATA%\Manager\manager.db
 *
 * Override at any time with the MANAGER_DB_PATH env var:
 *   MANAGER_DB_PATH=/tmp/test.db bun run db:studio
 */
function resolveDevDbPath(): string {
  if (process.env["MANAGER_DB_PATH"]) {
    return process.env["MANAGER_DB_PATH"];
  }

  const home = os.homedir();

  switch (process.platform) {
    case "darwin":
      return Path.join(
        home,
        "Library",
        "Application Support",
        "Manager",
        "manager.db",
      );
    case "win32":
      return Path.join(process.env["APPDATA"] ?? home, "Manager", "manager.db");
    default: // linux + others
      return Path.join(home, ".config", "Manager", "manager.db");
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveDevDbPath(),
  },
  migrations: {
    table: "migrations",
  },
});
