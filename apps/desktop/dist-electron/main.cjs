//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let node_path = require("node:path");
node_path = __toESM(node_path, 1);
let node_fs = require("node:fs");
node_fs = __toESM(node_fs, 1);
let electron_main = require("electron/main");
//#region src/updateChannels.ts
const NIGHTLY_VERSION_PATTERN = /-nightly\.\d{8}\.\d+$/;
function isNightlyDesktopVersion(version) {
	return NIGHTLY_VERSION_PATTERN.test(version);
}
//#endregion
//#region src/appBranding.ts
const APP_BASE_NAME = "Manager";
function resolveDesktopAppStageLabel(input) {
	if (input.isDevelopment) return "Dev";
	return isNightlyDesktopVersion(input.appVersion) ? "Nightly" : "Alpha";
}
function resolveDesktopAppBranding(input) {
	const stageLabel = resolveDesktopAppStageLabel(input);
	return {
		baseName: APP_BASE_NAME,
		stageLabel,
		displayName: `${APP_BASE_NAME} (${stageLabel})`
	};
}
//#endregion
//#region src/main.ts
const ROOT_DIR = node_path.resolve(__dirname, "../../..");
const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);
const TITLEBAR_HEIGHT = 40;
const TITLEBAR_COLOR = "#01000000";
const TITLEBAR_LIGHT_SYMBOL_COLOR = "#1f2937";
const TITLEBAR_DARK_SYMBOL_COLOR = "#f8fafc";
const desktopAppBranding = resolveDesktopAppBranding({
	isDevelopment,
	appVersion: electron.app.getVersion()
});
const APP_DISPLAY_NAME = desktopAppBranding.displayName;
let mainWindow = null;
function getInitialWindowBackgroundColor() {
	return electron.nativeTheme.shouldUseDarkColors ? "#0a0a0a" : "#ffffff";
}
function resolveResourcePath(fileName) {
	const candidates = [
		node_path.join(__dirname, "../resources", fileName),
		node_path.join(__dirname, "../prod-resources", fileName),
		node_path.join(process.resourcesPath, "resources", fileName),
		node_path.join(process.resourcesPath, fileName)
	];
	for (const candidate of candidates) if (node_fs.existsSync(candidate)) return candidate;
	return null;
}
function resolveIconPath(ext) {
	if (isDevelopment && process.platform === "darwin" && ext === "png") {
		const developmentDockIconPath = node_path.join(ROOT_DIR, "assets", "dev", "blueprint-macos-1024.png");
		if (node_fs.existsSync(developmentDockIconPath)) return developmentDockIconPath;
	}
	return resolveResourcePath(`icon.${ext}`);
}
function getIconOption() {
	if (process.platform === "darwin") return {};
	const iconPath = resolveIconPath(process.platform === "win32" ? "ico" : "png");
	return iconPath ? { icon: iconPath } : {};
}
function getWindowTitleBarOptions() {
	if (process.platform === "darwin") return {
		titleBarStyle: "hiddenInset",
		trafficLightPosition: {
			x: 16,
			y: 18
		}
	};
	return {
		titleBarStyle: "hidden",
		titleBarOverlay: {
			color: TITLEBAR_COLOR,
			height: TITLEBAR_HEIGHT,
			symbolColor: electron.nativeTheme.shouldUseDarkColors ? TITLEBAR_DARK_SYMBOL_COLOR : TITLEBAR_LIGHT_SYMBOL_COLOR
		}
	};
}
const GET_APP_BRANDING_CHANNEL = "desktop:get-app-branding";
function registerIpcHandlers() {
	electron_main.ipcMain.removeAllListeners(GET_APP_BRANDING_CHANNEL);
	electron_main.ipcMain.on(GET_APP_BRANDING_CHANNEL, (event) => {
		event.returnValue = desktopAppBranding;
	});
}
function createWindow() {
	mainWindow = new electron.BrowserWindow({
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
			preload: node_path.join(__dirname, "preload.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true
		}
	});
	const appUrl = isDevelopment ? process.env.VITE_DEV_SERVER_URL : "http://127.0.0.1:3000";
	mainWindow.loadURL(appUrl?.toString() ?? "http://127.0.0.1:3000");
	if (isDevelopment) mainWindow.webContents.openDevTools({ mode: "detach" });
	mainWindow.once("ready-to-show", () => {
		if (!mainWindow) return;
		mainWindow.show();
	});
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		electron.shell.openExternal(url);
		return { action: "deny" };
	});
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}
electron.app.whenReady().then(() => {
	registerIpcHandlers();
	createWindow();
});
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion

//# sourceMappingURL=main.cjs.map