import {
  app,
  BrowserWindow,
  nativeTheme,
  protocol,
  shell,
  type BrowserWindowConstructorOptions,
} from "electron";
import * as Path from "node:path";
import * as FS from "node:fs";
import { resolveDesktopAppBranding } from "./appBranding.ts";
import type {
  DesktopAppBranding,
  IntegrationKind,
  ServerConfig,
} from "@manager/contracts";
import { ipcMain } from "electron/main";
import { getDatabase, closeDatabase } from "./database.ts";
import {
  readSettings,
  updateSettings,
  resetSettings,
} from "./settingsService.ts";
import {
  buildServerIntegration,
  connectIntegration,
  disconnectIntegration,
  handleProtocolUrl,
} from "./integrationManager.ts";

// Register the custom `manager://` protocol BEFORE `app.ready` so the OS
// associates it with this app for OAuth2 redirect callbacks.
protocol.registerSchemesAsPrivileged([
  { scheme: "manager", privileges: { standard: true, secure: false } },
]);

const ROOT_DIR = Path.resolve(__dirname, "../../..");
const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);

const DESKTOP_LOOPBACK_HOST = "127.0.0.1";
const DESKTOP_REQUIRED_PORT_PROBE_HOSTS = ["0.0.0.0", "::"] as const;
const TITLEBAR_HEIGHT = 40;
const TITLEBAR_COLOR = "#01000000"; // #00000000 does not work correctly on Linux
const TITLEBAR_LIGHT_SYMBOL_COLOR = "#1f2937";
const TITLEBAR_DARK_SYMBOL_COLOR = "#f8fafc";
const desktopAppBranding: DesktopAppBranding = resolveDesktopAppBranding({
  isDevelopment,
  appVersion: app.getVersion(),
});
const APP_DISPLAY_NAME = desktopAppBranding.displayName;
let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

type WindowTitleBarOptions = Pick<
  BrowserWindowConstructorOptions,
  "titleBarOverlay" | "titleBarStyle" | "trafficLightPosition"
>;

function getInitialWindowBackgroundColor(): string {
  return nativeTheme.shouldUseDarkColors ? "#0a0a0a" : "#ffffff";
}

function resolveResourcePath(fileName: string): string | null {
  const candidates = [
    Path.join(__dirname, "../resources", fileName),
    Path.join(__dirname, "../prod-resources", fileName),
    Path.join(process.resourcesPath, "resources", fileName),
    Path.join(process.resourcesPath, fileName),
  ];

  for (const candidate of candidates) {
    if (FS.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function resolveIconPath(ext: "ico" | "icns" | "png"): string | null {
  if (isDevelopment && process.platform === "darwin" && ext === "png") {
    const developmentDockIconPath = Path.join(
      ROOT_DIR,
      "assets",
      "dev",
      "blueprint-macos-1024.png",
    );
    if (FS.existsSync(developmentDockIconPath)) {
      return developmentDockIconPath;
    }
  }

  return resolveResourcePath(`icon.${ext}`);
}

function getIconOption(): { icon: string } | Record<string, never> {
  if (process.platform === "darwin") return {}; // macOS uses .icns from app bundle
  const ext = process.platform === "win32" ? "ico" : "png";
  const iconPath = resolveIconPath(ext);
  return iconPath ? { icon: iconPath } : {};
}

function getWindowTitleBarOptions(): WindowTitleBarOptions {
  if (process.platform === "darwin") {
    return {
      titleBarStyle: "hiddenInset",
      trafficLightPosition: { x: 16, y: 18 },
    };
  }

  return {
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: TITLEBAR_COLOR,
      height: TITLEBAR_HEIGHT,
      symbolColor: nativeTheme.shouldUseDarkColors
        ? TITLEBAR_DARK_SYMBOL_COLOR
        : TITLEBAR_LIGHT_SYMBOL_COLOR,
    },
  };
}

const GET_APP_BRANDING_CHANNEL = "desktop:get-app-branding";
const GET_SERVER_CONFIG_CHANNEL = "desktop:get-server-config";
const UPDATE_SETTINGS_CHANNEL = "desktop:update-settings";
const RESET_SETTINGS_CHANNEL = "desktop:reset-settings";
const CONNECT_INTEGRATION_CHANNEL = "desktop:connect-integration";
const DISCONNECT_INTEGRATION_CHANNEL = "desktop:disconnect-integration";

// ---------------------------------------------------------------------------
// Helper — build a full ServerConfig snapshot from the current DB state
// ---------------------------------------------------------------------------

function buildServerConfig(): ServerConfig {
  const db = getDatabase();
  const settings = readSettings(db);

  const integrationKinds: IntegrationKind[] = [
    "github",
    "bitbucket",
    "google",
    "mobilbank-sparebank",
  ];

  return {
    settings,
    integrations: Object.fromEntries(
      integrationKinds.map((kind) => {
        const enabled =
          kind === "github"
            ? settings.integrations.github.enabled
            : kind === "bitbucket"
              ? settings.integrations.bitbucket.enabled
              : kind === "google"
                ? settings.integrations.google.enabled
                : settings.integrations["mobilbank-sparebank"].enabled;

        return [kind, buildServerIntegration(kind, enabled)];
      }),
    ) as ServerConfig["integrations"],
  };
}

function registerIpcHandlers(): void {
  ipcMain.removeAllListeners(GET_APP_BRANDING_CHANNEL);
  ipcMain.removeAllListeners(GET_SERVER_CONFIG_CHANNEL);
  ipcMain.removeAllListeners(UPDATE_SETTINGS_CHANNEL);
  ipcMain.removeAllListeners(RESET_SETTINGS_CHANNEL);
  ipcMain.removeAllListeners(CONNECT_INTEGRATION_CHANNEL);
  ipcMain.removeAllListeners(DISCONNECT_INTEGRATION_CHANNEL);

  // Synchronous — returns app branding immediately.
  ipcMain.on(GET_APP_BRANDING_CHANNEL, (event) => {
    event.returnValue = desktopAppBranding;
  });

  // Async handlers — all return a ServerConfig or a result object.
  ipcMain.handle(GET_SERVER_CONFIG_CHANNEL, () => buildServerConfig());

  ipcMain.handle(
    UPDATE_SETTINGS_CHANNEL,
    (_, patch: Parameters<typeof updateSettings>[1]) => {
      const db = getDatabase();
      updateSettings(db, patch);
      return buildServerConfig();
    },
  );

  ipcMain.handle(RESET_SETTINGS_CHANNEL, () => {
    const db = getDatabase();
    resetSettings(db);
    return buildServerConfig();
  });

  ipcMain.handle(
    CONNECT_INTEGRATION_CHANNEL,
    async (_, kind: IntegrationKind) => {
      const db = getDatabase();
      return connectIntegration(kind, db);
    },
  );

  ipcMain.handle(DISCONNECT_INTEGRATION_CHANNEL, (_, kind: IntegrationKind) => {
    const db = getDatabase();
    disconnectIntegration(kind, db);
    return buildServerConfig();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
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
      preload: Path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const appUrl = isDevelopment
    ? process.env.VITE_DEV_SERVER_URL
    : "http://127.0.0.1:3000";

  mainWindow.loadURL(appUrl?.toString() ?? "http://127.0.0.1:3000");

  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow) return;

    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialise the SQLite database (runs migrations if needed).
  getDatabase();

  // Handle manager:// protocol URLs — used for OAuth2 redirects.
  protocol.handle("manager", (request) => {
    void handleProtocolUrl(request.url, getDatabase());
    return new Response(null, { status: 204 });
  });

  registerIpcHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  closeDatabase();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
