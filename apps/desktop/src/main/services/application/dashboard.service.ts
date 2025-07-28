import {
  IDashboardWidgetInstance,
  IDashboardWidgetItem
} from '@manager/common/src'
import { db } from '../../database/data-source'
import { eq } from 'drizzle-orm'
import { seedWidgetInstancesIfEmpty } from './dashboard/seed'
import { defaultWidgets } from './dashboard/widgetDefinitions'
import { widgetInstance } from '../../database/models/schema'

export const DashboardService = {
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
      iconUrl: def.iconUrl ?? '',
      source: def.source ?? ''
    }))
  },

  async getWidgetInstances(): Promise<IDashboardWidgetInstance[]> {
    await seedWidgetInstancesIfEmpty()

    const widgetInstanceRows = await db.select().from(widgetInstance)

    return widgetInstanceRows.map((w) => ({
      id: w.id,
      definitionId: w.definitionId,
      layout: w.layout,
      static: w.static,
      settings: w.settings ?? {}
    }))
  },

  /*async getDefaultWidgets(): Promise<IDashboardWidgetItem[]> {
    await seedWidgetsAndDefinitionsIfEmpty()

    const defs = await db.select().from(defTable)

    return defs.map((def) => ({
      id: def.id,
      definitionId: def.id,
      type: def.type,
      name: def.name,
      description: def.description,
      layout: {},
      static: false,

      settings: {},
      settingsSchema: def.settingsSchema,

      requirements: def.requirements ?? [],
      locales: def.locales ?? [],

      active: true
    }))
  },*/

  async saveUserDashboard(
    widgetInstances: IDashboardWidgetInstance[]
  ): Promise<void> {
    if (!widgetInstances.length) throw new Error('No widget instances provided')

    await db.delete(widgetInstance).run()

    const inserts = widgetInstances.map((w) => ({
      id: w.id,
      definitionId: w.definitionId,
      layout: w.layout,
      static: w.static,
      settings: w.settings
    }))

    await db.insert(widgetInstance).values(inserts).run()
  },

  async removeWidget(widgetInstanceId: string): Promise<void> {
    const existing = await db
      .select()
      .from(widgetInstance)
      .where(eq(widgetInstance.id, widgetInstanceId))

    if (existing.length === 0) return // nothing to remove
    if (existing[0].definitionId !== widgetInstanceId) {
      throw new Error(
        `Widget ${widgetInstanceId} does not match its definition ID ${existing[0].definitionId}`
      )
    }

    await db
      .delete(widgetInstance)
      .where(eq(widgetInstance.id, widgetInstanceId))
      .run()
  },

  async getWidgetInstanceData(
    widgetId: string
  ): Promise<IDashboardWidgetInstance | null> {
    const instances = await this.getWidgetInstances()
    return instances.find((w) => w.id === widgetId) || null
  },

  async fetchWidgetData(
    widgetInstance: IDashboardWidgetInstance
  ): Promise<any> {
    // Every widget should implement its own data fetching logic, call that.
    // Find the real widget definition by ID
    const widgetDefinitions = defaultWidgets.filter(
      (w) => w.id === widgetInstance.definitionId
    )

    // Call the widget data fetching method, with the instance settings
    if (widgetDefinitions.length === 0) {
      throw new Error(
        `Widget definition not found for ID: ${widgetInstance.definitionId}`
      )
    }

    const widgetDef = widgetDefinitions[0]
    return widgetDef.fetchData
      ? widgetDef.fetchData(widgetInstance.settings)
      : null
  }
}
