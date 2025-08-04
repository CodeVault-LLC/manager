import { BrowserWindow, IpcMain } from "electron";
import { IModule, CoreMainAPI } from "@manager/core";
import * as path from "path";

// This would be your real DB client, profile service, etc.
const MOCK_DB = { query: async () => [{ title: "Module Movie" }] };
const MOCK_PROFILE = {
  getCurrentUser: async () => ({ id: "1", name: "Admin" }),
};

export class ModuleManager {
  private activeModules: IModule[] = [];
  private coreApi: CoreMainAPI;

  constructor(private ipcMain: IpcMain, private window: BrowserWindow) {
    // Construct the Core API that will be passed to modules
    this.coreApi = {
      ipc: this.ipcMain,
      database: MOCK_DB,
      profile: MOCK_PROFILE,
      utils: { parseTimestamp: (ts) => new Date(ts) },
    };
  }

  async loadModules() {
    // 1. In a real app, you'd fetch/install modules from your Registry here.
    // For this example, we'll just load a local module file.
    const modulePath = path.resolve(
      __dirname,
      "../../modules/entertainment/index.js"
    );
    const { default: moduleInstance } = await import(modulePath);

    if (moduleInstance) {
      this.activeModules.push(moduleInstance);
    }

    // 2. Initialize all loaded modules and collect their UI hooks
    const allSidebarItems = [];
    for (const mod of this.activeModules) {
      mod.onLoad(this.coreApi); // Provide the Core API
      const items = mod.getSidebarItems(); // Call the sidebar hook
      allSidebarItems.push(...items);
    }

    // 3. Send the collected UI data to the renderer process
    this.window.webContents.send("core:update-sidebar", allSidebarItems);
  }

  getActiveModules() {
    return this.activeModules;
  }
}
