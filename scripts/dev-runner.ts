#!/usr/bin/env node

import {
  spawn,
  type ChildProcess,
  type SpawnOptions,
} from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const desktopDir = resolve(repoRoot, "apps/desktop");
const baseWebPort = 5173;
const desktopLoopbackHost = "127.0.0.1";
const maxHashOffset = 3000;
const supportedModes = ["dev", "dev:desktop", "dev:web"] as const;
const webWorkspaceCandidates = [
  resolve(repoRoot, "apps/web"),
  resolve(repoRoot, "apps/site"),
  resolve(repoRoot, "apps/website"),
] as const;

type DevMode = (typeof supportedModes)[number];

interface DevRunnerCliInput {
  readonly mode: DevMode;
  readonly host?: string;
  readonly port?: number;
  readonly devUrl?: URL;
  readonly dryRun: boolean;
}

interface ManagedChild {
  readonly label: string;
  readonly process: ChildProcess;
}

function isDevMode(value: string): value is DevMode {
  return supportedModes.includes(value as DevMode);
}

function parsePort(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
    throw new Error(`Invalid port: ${value}`);
  }

  return parsed;
}

function parseUrl(value: string | undefined): URL | undefined {
  if (!value) {
    return undefined;
  }

  const url = new URL(value);
  if (!url.port) {
    throw new Error(
      `VITE_DEV_SERVER_URL must include an explicit port: ${value}`,
    );
  }

  return url;
}

function parseBooleanEnv(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function hashOffset(input: string): number {
  const digest = createHash("sha256").update(input).digest("hex");
  return Number.parseInt(digest.slice(0, 8), 16) % maxHashOffset;
}

function resolveOffset(): { offset: number; source: string } {
  const explicitOffset =
    process.env.MANAGER_PORT_OFFSET ?? process.env.T3CODE_PORT_OFFSET;
  if (explicitOffset !== undefined) {
    const parsed = Number.parseInt(explicitOffset, 10);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new Error(`Invalid port offset: ${explicitOffset}`);
    }

    return { offset: parsed, source: "env:MANAGER_PORT_OFFSET" };
  }

  const devInstance =
    process.env.MANAGER_DEV_INSTANCE ?? process.env.T3CODE_DEV_INSTANCE;
  if (devInstance) {
    return {
      offset: hashOffset(devInstance),
      source: "env:MANAGER_DEV_INSTANCE",
    };
  }

  return { offset: 0, source: "default" };
}

function resolveWebWorkspaceDir(): string | undefined {
  return webWorkspaceCandidates.find((candidate) =>
    existsSync(resolve(candidate, "package.json")),
  );
}

function resolveDevUrl(input: {
  readonly host?: string;
  readonly port?: number;
  readonly devUrl?: URL;
  readonly defaultPort: number;
}): URL {
  if (input.devUrl) {
    return input.devUrl;
  }

  const envUrl = parseUrl(process.env.VITE_DEV_SERVER_URL?.trim());
  if (envUrl) {
    return envUrl;
  }

  const host = input.host?.trim() || desktopLoopbackHost;
  const port = input.port ?? input.defaultPort;
  return new URL(`http://${host}:${port}`);
}

function canBindPort(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, host);
  });
}

async function resolveAvailablePort(
  host: string,
  preferredPort: number,
): Promise<number> {
  let candidatePort = preferredPort;

  while (candidatePort <= 65_535) {
    if (await canBindPort(host, candidatePort)) {
      return candidatePort;
    }

    candidatePort += 1;
  }

  throw new Error(
    `Unable to find an available port starting from ${preferredPort}`,
  );
}

function log(message: string): void {
  process.stdout.write(`${message}\n`);
}

function spawnManagedProcess(input: {
  readonly label: string;
  readonly command: string;
  readonly args: string[];
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
}): ManagedChild {
  const options: SpawnOptions = {
    cwd: input.cwd,
    env: input.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  };

  return {
    label: input.label,
    process: spawn(input.command, input.args, options),
  };
}

function terminateChild(child: ChildProcess, signal: NodeJS.Signals): void {
  if (child.killed) {
    return;
  }

  try {
    child.kill(signal);
  } catch {
    // Ignore shutdown races.
  }
}

export async function runDevRunnerWithInput(
  input: DevRunnerCliInput,
): Promise<void> {
  const { offset, source } = resolveOffset();
  const host = input.host?.trim() || desktopLoopbackHost;
  const defaultPort = baseWebPort + offset;
  const requestedDevUrl = resolveDevUrl({
    host,
    port: input.port,
    devUrl: input.devUrl,
    defaultPort,
  });
  const webWorkspaceDir = resolveWebWorkspaceDir();
  const shouldRunDesktop = input.mode !== "dev:web";
  const shouldRunWeb = webWorkspaceDir !== undefined;
  const requestedPort = Number.parseInt(requestedDevUrl.port, 10);

  const devUrl =
    shouldRunWeb && input.devUrl === undefined
      ? new URL(
          `${requestedDevUrl.protocol}//${requestedDevUrl.hostname}:${String(await resolveAvailablePort(requestedDevUrl.hostname, requestedPort))}`,
        )
      : requestedDevUrl;

  if (input.mode === "dev:web" && !shouldRunWeb && !input.devUrl) {
    throw new Error(
      "No web workspace was found under apps/web, apps/site, or apps/website. Provide --dev-url to target an external web app.",
    );
  }

  const sharedEnv: NodeJS.ProcessEnv = {
    ...process.env,
    MANAGER_DEV_SERVER_URL: devUrl.toString(),
    MANAGER_PORT_OFFSET: String(offset),
    VITE_DEV_SERVER_URL: devUrl.toString(),
  };

  log(
    `[dev-runner] mode=${input.mode} source=${source} url=${devUrl.toString()} desktop=${shouldRunDesktop} web=${shouldRunWeb}`,
  );

  const plannedCommands: Array<{
    readonly label: string;
    readonly command: string;
    readonly args: string[];
    readonly cwd: string;
  }> = [];

  if (shouldRunWeb && webWorkspaceDir) {
    plannedCommands.push({
      label: "web",
      command: "bun",
      args: [
        "run",
        "dev",
        "--",
        "--host",
        devUrl.hostname,
        "--port",
        devUrl.port,
        "--strictPort",
      ],
      cwd: webWorkspaceDir,
    });
  }

  if (shouldRunDesktop) {
    plannedCommands.push({
      label: "desktop:bundle",
      command: "bun",
      args: ["run", "dev:bundle"],
      cwd: desktopDir,
    });
    plannedCommands.push({
      label: "desktop:electron",
      command: "bun",
      args: ["run", "dev:electron"],
      cwd: desktopDir,
    });
  }

  if (input.dryRun) {
    for (const planned of plannedCommands) {
      log(
        `[dry-run] ${planned.label}: (cd ${planned.cwd} && ${planned.command} ${planned.args.join(" ")})`,
      );
    }
    return;
  }

  const children = plannedCommands.map((planned) =>
    spawnManagedProcess({
      ...planned,
      env:
        planned.label === "web"
          ? {
              ...sharedEnv,
              HOST: devUrl.hostname,
              PORT: devUrl.port,
            }
          : sharedEnv,
    }),
  );

  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals, exitCode = 0): void => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    for (const child of children) {
      terminateChild(child.process, signal);
    }
    process.exitCode = exitCode;
  };

  process.once("SIGINT", () => shutdown("SIGTERM", 130));
  process.once("SIGTERM", () => shutdown("SIGTERM", 143));

  await new Promise<void>((resolve, reject) => {
    let remaining = children.length;

    for (const child of children) {
      child.process.once("error", (error) => {
        shutdown("SIGTERM", 1);
        reject(error);
      });

      child.process.once("exit", (code, signal) => {
        remaining -= 1;

        if (shuttingDown) {
          if (remaining === 0) {
            resolve();
          }
          return;
        }

        if (code !== 0) {
          shutdown("SIGTERM", code ?? 1);
          reject(
            new Error(
              `${child.label} exited unexpectedly with ${signal ?? `code ${code ?? 1}`}`,
            ),
          );
          return;
        }

        if (remaining === 0) {
          resolve();
        }
      });
    }
  });
}

function readCliInput(argv: string[]): DevRunnerCliInput {
  const [modeArgument, ...rest] = argv;
  if (!modeArgument || !isDevMode(modeArgument)) {
    throw new Error(
      `Usage: dev-runner <${supportedModes.join("|")}> [--host HOST] [--port PORT] [--dev-url URL] [--dry-run]`,
    );
  }

  const { values } = parseArgs({
    args: rest,
    options: {
      host: { type: "string" },
      port: { type: "string" },
      "dev-url": { type: "string" },
      "dry-run": { type: "boolean" },
    },
    allowPositionals: false,
  });

  return {
    mode: modeArgument,
    host: values.host,
    port: parsePort(values.port),
    devUrl: parseUrl(values["dev-url"]),
    dryRun: values["dry-run"] || parseBooleanEnv(process.env.MANAGER_DRY_RUN),
  };
}

const cliInput = readCliInput(process.argv.slice(2));

runDevRunnerWithInput(cliInput).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[dev-runner] ${message}\n`);
  process.exitCode = 1;
});
