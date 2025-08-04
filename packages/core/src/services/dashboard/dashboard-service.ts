import {
  IDashboardWidgetInstance,
  IDashboardWidgetItem,
} from "@manager/common";
import { seedWidgetInstancesIfEmpty } from "./seed";
import { DataService } from "@manager/data";
import { defaultWidgets } from "./widget-definitions";
import { widgetInstance } from "@manager/data/models/schema";

/**
 * DashboardService class for managing dashboard widgets and instances.
 * This service provides methods to retrieve, save, and manipulate dashboard widgets
 * and their instances, ensuring a consistent interface for dashboard operations.
 */
export class DashboardService {
  private static instance: DashboardService;

  constructor() {
    if (DashboardService.instance) {
      throw new Error(
        "DashboardService is a singleton and cannot be instantiated multiple times."
      );
    }

    DashboardService.instance = this;
  }

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }

    return DashboardService.instance;
  }

  getDefaultWidgets(): IDashboardWidgetItem[] {
    return defaultWidgets.map((def) => ({
      id: def.id,
      type: def.type,
      name: def.name,
      description: def.description,
      settingsSchema: def.settingsSchema,
      locales: def.locales ?? [],
      defaultLayout: def.layout,
      requirements: def.requirements ?? [],
      iconUrl: def.iconUrl ?? "",
      source: def.source ?? "",
    }));
  }

  async getWidgetInstances(): Promise<IDashboardWidgetInstance[]> {
    const db = DataService.getInstance().getDatabase();

    await seedWidgetInstancesIfEmpty();

    const widgetInstanceRows = await db.select().from(widgetInstance);

    return widgetInstanceRows.map((w) => ({
      id: w.id,
      definitionId: w.definitionId,
      layout: w.layout,
      static: w.static,
      settings: w.settings ?? {},
    }));
  }

  async saveUserDashboard(
    widgetInstances: IDashboardWidgetInstance[]
  ): Promise<void> {
    const db = DataService.getInstance().getDatabase();

    if (!widgetInstances.length)
      throw new Error("No widget instances provided");

    await db.delete(widgetInstance).run();

    const inserts = widgetInstances.map((w) => ({
      id: w.id,
      definitionId: w.definitionId,
      layout: w.layout,
      static: w.static,
      settings: w.settings,
    }));

    await db.insert(widgetInstance).values(inserts).run();
  }

  async removeWidget(widgetInstanceId: string): Promise<void> {
    const db = DataService.getInstance().getDatabase();
    const { eq } = DataService.getInstance().getDatabaseSQL();

    const existing = await db
      .select()
      .from(widgetInstance)
      .where(eq(widgetInstance.id, widgetInstanceId));

    if (existing.length === 0) return; // nothing to remove
    if (existing[0].definitionId !== widgetInstanceId) {
      throw new Error(
        `Widget ${widgetInstanceId} does not match its definition ID ${existing[0].definitionId}`
      );
    }

    await db
      .delete(widgetInstance)
      .where(eq(widgetInstance.id, widgetInstanceId))
      .run();
  }

  async getWidgetInstanceData(
    widgetId: string
  ): Promise<IDashboardWidgetInstance | null> {
    const instances = await this.getWidgetInstances();
    return instances.find((w) => w.id === widgetId) || null;
  }

  async fetchWidgetData(
    widgetInstance: IDashboardWidgetInstance
  ): Promise<any> {
    const widgetDefinitions = defaultWidgets.filter(
      (w) => w.id === widgetInstance.definitionId
    );

    if (widgetDefinitions.length === 0) {
      throw new Error(
        `Widget definition not found for ID: ${widgetInstance.definitionId}`
      );
    }

    const widgetDef = widgetDefinitions[0];
    return widgetDef.fetchData
      ? widgetDef.fetchData(widgetInstance.settings)
      : null;
  }
}
