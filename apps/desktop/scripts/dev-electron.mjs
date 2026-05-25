import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  watch,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { desktopDir, resolveElectronPath } from "./electron-launcher.mjs";
import { waitForResources } from "./wait-for-resources.mjs";

const devServerUrl = process.env.VITE_DEV_SERVER_URL?.trim();
if (!devServerUrl) {
  throw new Error("VITE_DEV_SERVER_URL is required for desktop development.");
}

const devServer = new URL(devServerUrl);
const port = Number.parseInt(devServer.port, 10);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error(
    `VITE_DEV_SERVER_URL must include an explicit port: ${devServerUrl}`,
  );
}

const requiredFiles = ["dist-electron/main.cjs", "dist-electron/preload.cjs"];
const watchedDirectories = [
  { directory: "dist-electron", files: new Set(["main.cjs", "preload.cjs"]) },
];
const forcedShutdownTimeoutMs = 1_500;
const restartDebounceMs = 120;
const childTreeGracePeriodMs = 1_200;

await waitForResources({
  baseDir: desktopDir,
  files: requiredFiles,
  tcpHost: devServer.hostname,
  tcpPort: port,
});

const childEnv = { ...process.env };

function applyEnvFile(targetEnv, absoluteFilePath) {
  if (!existsSync(absoluteFilePath)) {
    return;
  }

  const contents = readFileSync(absoluteFilePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    if (!key || targetEnv[key] !== undefined) {
      continue;
    }

    const rawValue = line.slice(equalsIndex + 1).trim();
    const quotedValue =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"));
    targetEnv[key] = quotedValue ? rawValue.slice(1, -1) : rawValue;
  }
}

applyEnvFile(childEnv, join(desktopDir, ".env"));
applyEnvFile(childEnv, join(desktopDir, ".env.local"));

delete childEnv.ELECTRON_RUN_AS_NODE;

let shuttingDown = false;
let restartTimer = null;
let currentApp = null;
let restartQueue = Promise.resolve();
const expectedExits = new WeakSet();
const watchers = [];

function killChildTreeByPid(pid, signal) {
  if (process.platform === "win32" || typeof pid !== "number") {
    return;
  }

  spawnSync("pkill", [`-${signal}`, "-P", String(pid)], { stdio: "ignore" });
}

function cleanupStaleDevApps() {
  if (process.platform === "win32") {
    return;
  }

  spawnSync("pkill", ["-f", "--", `--manager-dev-root=${desktopDir}`], {
    stdio: "ignore",
  });
}

function escapeDesktopExecArg(value) {
  return String(value).replace(/([\\\s"'`$])/g, "\\$1");
}

function ensureLinuxProtocolHandler() {
  if (process.platform !== "linux") {
    return;
  }

  const applicationsDir = join(homedir(), ".local", "share", "applications");
  const desktopFileName = "manager-dev.desktop";
  const desktopFilePath = join(applicationsDir, desktopFileName);
  const electronPath = resolveElectronPath();
  const mainEntryPath = join(desktopDir, "dist-electron", "main.cjs");
  const iconPath = join(desktopDir, "src", "assets", "icon.png");
  const execParts = [
    escapeDesktopExecArg(electronPath),
    escapeDesktopExecArg(`--manager-dev-root=${desktopDir}`),
    escapeDesktopExecArg(mainEntryPath),
    "%u",
  ];

  const desktopEntry = [
    "[Desktop Entry]",
    "Type=Application",
    "Version=1.0",
    "Name=Manager (Dev)",
    "Comment=Manager desktop development handler",
    `Exec=${execParts.join(" ")}`,
    `Icon=${escapeDesktopExecArg(iconPath)}`,
    "NoDisplay=true",
    "Terminal=false",
    "StartupNotify=false",
    "MimeType=x-scheme-handler/manager;",
    "Categories=Development;",
    "",
  ].join("\n");

  try {
    mkdirSync(applicationsDir, { recursive: true });
    writeFileSync(desktopFilePath, desktopEntry, "utf8");

    const updateDb = spawnSync("update-desktop-database", [applicationsDir], {
      stdio: "ignore",
    });
    if (updateDb.status !== 0) {
      // Optional in many setups; URI registration can still work without it.
    }

    const setDefault = spawnSync(
      "xdg-mime",
      ["default", desktopFileName, "x-scheme-handler/manager"],
      { stdio: "ignore" },
    );

    if (setDefault.status !== 0) {
      console.warn(
        "[dev-electron] Failed to set x-scheme-handler/manager default via xdg-mime.",
      );
      return;
    }
  } catch (error) {
    console.warn("[dev-electron] Failed to register Linux URI handler:", error);
  }
}

function startApp() {
  if (shuttingDown || currentApp !== null) {
    return;
  }

  const app = spawn(
    resolveElectronPath(),
    [`--manager-dev-root=${desktopDir}`, "dist-electron/main.cjs"],
    {
      cwd: desktopDir,
      env: childEnv,
      stdio: "inherit",
    },
  );

  currentApp = app;

  app.once("error", () => {
    if (currentApp === app) {
      currentApp = null;
    }

    if (!shuttingDown) {
      scheduleRestart();
    }
  });

  app.once("exit", (code, signal) => {
    if (currentApp === app) {
      currentApp = null;
    }

    const exitedAbnormally = signal !== null || code !== 0;
    if (!shuttingDown && !expectedExits.has(app) && exitedAbnormally) {
      scheduleRestart();
    }
  });
}

async function stopApp() {
  const app = currentApp;
  if (!app) {
    return;
  }

  currentApp = null;
  expectedExits.add(app);

  await new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve();
    };

    app.once("exit", finish);
    app.kill("SIGTERM");
    killChildTreeByPid(app.pid, "TERM");

    setTimeout(() => {
      if (settled) {
        return;
      }

      app.kill("SIGKILL");
      killChildTreeByPid(app.pid, "KILL");
      finish();
    }, forcedShutdownTimeoutMs).unref();
  });
}

function scheduleRestart() {
  if (shuttingDown) {
    return;
  }

  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    restartTimer = null;
    restartQueue = restartQueue
      .catch(() => undefined)
      .then(async () => {
        await stopApp();
        if (!shuttingDown) {
          startApp();
        }
      });
  }, restartDebounceMs);
}

function startWatchers() {
  for (const { directory, files } of watchedDirectories) {
    const watcher = watch(
      join(desktopDir, directory),
      { persistent: true },
      (_eventType, filename) => {
        if (typeof filename !== "string" || !files.has(filename)) {
          return;
        }

        scheduleRestart();
      },
    );

    watchers.push(watcher);
  }
}

function killChildTree(signal) {
  if (process.platform === "win32") {
    return;
  }

  // Kill direct children as a final fallback in case normal shutdown leaves stragglers.
  spawnSync("pkill", [`-${signal}`, "-P", String(process.pid)], {
    stdio: "ignore",
  });
}

async function shutdown(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  for (const watcher of watchers) {
    watcher.close();
  }

  await stopApp();
  killChildTree("TERM");
  await new Promise((resolve) => {
    setTimeout(resolve, childTreeGracePeriodMs);
  });
  killChildTree("KILL");

  process.exit(exitCode);
}

startWatchers();
cleanupStaleDevApps();
ensureLinuxProtocolHandler();
startApp();

process.once("SIGINT", () => {
  void shutdown(130);
});
process.once("SIGTERM", () => {
  void shutdown(143);
});
process.once("SIGHUP", () => {
  void shutdown(129);
});
