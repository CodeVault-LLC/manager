import { shell } from "electron";
import { spawn } from "node:child_process";
import type { ConnectIntegrationOptions } from "@manager/contracts";

function normalizeCommand(command: string): string {
  return command.trim();
}

export async function launchOAuthUrl(
  url: string,
  options?: ConnectIntegrationOptions,
): Promise<void> {
  const mode = options?.launchMode ?? "default-browser";

  if (mode === "copy-url") {
    // Intentionally skip opening a browser. Renderer can copy/display the URL.
    return;
  }

  if (mode === "custom-browser") {
    const command = normalizeCommand(options?.browserCommand ?? "");
    if (!command) {
      throw new Error("No browser command was provided.");
    }

    await new Promise<void>((resolve, reject) => {
      const child = spawn(command, [url], {
        detached: true,
        stdio: "ignore",
      });

      child.once("error", () => {
        reject(
          new Error(
            `Failed to launch browser command \"${command}\". Ensure it is installed and on PATH.`,
          ),
        );
      });

      child.once("spawn", () => {
        child.unref();
        resolve();
      });
    });

    return;
  }

  await shell.openExternal(url);
}
