import { IExtension } from "@manager/common";
import { api } from "@manager/core/http/server-http-client";
import { DataService } from "@manager/data";

export class ExtensionService {
  static instance: ExtensionService;
  private extensionPath: string;

  static getInstance(): ExtensionService {
    if (!ExtensionService.instance) {
      ExtensionService.instance = new ExtensionService();
    }
    return ExtensionService.instance;
  }

  private constructor(extensionPath: string = "") {
    if (ExtensionService.instance) {
      throw new Error(
        "Use ExtensionServicve.getInstance() to access the singleton instance."
      );
    }

    this.extensionPath = extensionPath;

    ExtensionService.instance = this;
  }

  async fetchAllExtensions(): Promise<IExtension[]> {
    try {
      const response = await api.get<IExtension[]>("/extensions");
      return response.data;
    } catch (error) {
      log.error("Error fetching extensions from marketplace:", error);
      throw error;
    }
  }

  async getInstalledExtensions() {
    try {
      const db = DataService.getInstance().getDatabase();

      const installedExtensions = await db.query.extensions.findMany();

      return installedExtensions;
    } catch (error) {
      log.error("Error fetching installed extensions:", error);
      throw error;
    }
  }

  // Update, Download functionality, Delete, Deactivate - Activate
  async updateExtension(extensionId: number): Promise<IExtension> {
    try {
      // Request a download stream from the server and store it in the path
      const response = await api.put<IExtension>(
        `/extensions/${extensionId}/update${this.extensionPath}`
      );

      return response.data;
    } catch (error) {
      log.error(`Error updating extension ${extensionId}:`, error);
      throw error;
    }
  }
}
