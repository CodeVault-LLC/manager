let electron = require("electron");
//#region src/preload.ts
const GET_APP_BRANDING_CHANNEL = "desktop:get-app-branding";
electron.contextBridge.exposeInMainWorld("desktopBridge", { getAppBranding: () => {
	const result = electron.ipcRenderer.sendSync(GET_APP_BRANDING_CHANNEL);
	if (typeof result !== "object" || result === null) return null;
	return result;
} });
//#endregion

//# sourceMappingURL=preload.cjs.map