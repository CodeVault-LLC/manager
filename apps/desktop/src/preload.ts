import type {
  DesktopBridge,
  ServerSettings,
  IntegrationKind,
} from "@manager/contracts";
import { contextBridge, ipcRenderer } from "electron";

const GET_APP_BRANDING_CHANNEL = "desktop:get-app-branding";
const GET_SERVER_CONFIG_CHANNEL = "desktop:get-server-config";
const UPDATE_SETTINGS_CHANNEL = "desktop:update-settings";
const RESET_SETTINGS_CHANNEL = "desktop:reset-settings";
const CONNECT_INTEGRATION_CHANNEL = "desktop:connect-integration";
const DISCONNECT_INTEGRATION_CHANNEL = "desktop:disconnect-integration";

contextBridge.exposeInMainWorld("desktopBridge", {
  getAppBranding: () => {
    const result = ipcRenderer.sendSync(GET_APP_BRANDING_CHANNEL);
    if (typeof result !== "object" || result === null) {
      return null;
    }
    return result as ReturnType<DesktopBridge["getAppBranding"]>;
  },

  getServerConfig: () => ipcRenderer.invoke(GET_SERVER_CONFIG_CHANNEL),

  updateSettings: (patch: Partial<ServerSettings>) =>
    ipcRenderer.invoke(UPDATE_SETTINGS_CHANNEL, patch),

  resetSettings: () => ipcRenderer.invoke(RESET_SETTINGS_CHANNEL),

  connectIntegration: (kind: IntegrationKind) =>
    ipcRenderer.invoke(CONNECT_INTEGRATION_CHANNEL, kind),

  disconnectIntegration: (kind: IntegrationKind) =>
    ipcRenderer.invoke(DISCONNECT_INTEGRATION_CHANNEL, kind),
} satisfies DesktopBridge);
