let electron = require("electron");
//#region src/preload.ts
const GET_APP_BRANDING_CHANNEL = "desktop:get-app-branding";
const GET_SERVER_CONFIG_CHANNEL = "desktop:get-server-config";
const UPDATE_SETTINGS_CHANNEL = "desktop:update-settings";
const RESET_SETTINGS_CHANNEL = "desktop:reset-settings";
const CONNECT_INTEGRATION_CHANNEL = "desktop:connect-integration";
const DISCONNECT_INTEGRATION_CHANNEL = "desktop:disconnect-integration";
electron.contextBridge.exposeInMainWorld("desktopBridge", {
	getAppBranding: () => {
		const result = electron.ipcRenderer.sendSync(GET_APP_BRANDING_CHANNEL);
		if (typeof result !== "object" || result === null) return null;
		return result;
	},
	getServerConfig: () => electron.ipcRenderer.invoke(GET_SERVER_CONFIG_CHANNEL),
	updateSettings: (patch) => electron.ipcRenderer.invoke(UPDATE_SETTINGS_CHANNEL, patch),
	resetSettings: () => electron.ipcRenderer.invoke(RESET_SETTINGS_CHANNEL),
	connectIntegration: (kind) => electron.ipcRenderer.invoke(CONNECT_INTEGRATION_CHANNEL, kind),
	disconnectIntegration: (kind) => electron.ipcRenderer.invoke(DISCONNECT_INTEGRATION_CHANNEL, kind)
});
//#endregion

//# sourceMappingURL=preload.cjs.map