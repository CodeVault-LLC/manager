import { IDashboardWidgetItem } from '@manager/common/src'
import { db } from '../../database/data-source'
import {
  widgets as widgetTable,
  widgetDefinitions as defTable
} from '../../database/models/schema'
import { eq } from 'drizzle-orm'
import { seedWidgetsAndDefinitionsIfEmpty } from './dashboard/seed'

export const DashboardService = {
  async getDefaultWidgets(): Promise<IDashboardWidgetItem[]> {
    await seedWidgetsAndDefinitionsIfEmpty()

    const defs = await db.select().from(defTable)

    return defs.map((def) => ({
      id: def.id,
      type: def.type,
      name: def.name,
      description: def.description,
      layout: {}, // will be overridden by user
      static: false,

      settings: {},
      settingsSchema: def.settingsSchema,

      requirements: def.requirements ?? [],
      locales: def.locales ?? [],

      active: true
    }))
  },

  async getUserDashboard(): Promise<IDashboardWidgetItem[]> {
    await seedWidgetsAndDefinitionsIfEmpty()

    const [widgetRows, defRows] = await Promise.all([
      db.select().from(widgetTable),
      db.select().from(defTable)
    ])

    const defMap = Object.fromEntries(defRows.map((def) => [def.id, def]))

    const existingWidgets: IDashboardWidgetItem[] = widgetRows.map((w) => {
      const def = defMap[w.definitionId]

      return {
        id: w.id,
        type: def?.type ?? 'unknown',
        name: def?.name ?? 'Unknown',
        description: def?.description ?? 'No description available',
        layout: w.layout,
        static: w.static,

        settings: w.settings ?? {},
        locales: def?.locales ?? [],
        settingsSchema: def?.settingsSchema ?? {},
        requirements: def?.requirements ?? [],

        active: w.active,
        data: undefined
      }
    })

    const widgetIds = new Set(widgetRows.map((w) => w.definitionId))
    const missingDefs = defRows.filter((def) => !widgetIds.has(def.id))

    const extraDefaults: IDashboardWidgetItem[] = missingDefs.map((def) => ({
      id: def.id,
      type: def.type,
      name: def.name,
      description: def.description,
      layout: {}, // default layout could come from somewhere else later
      static: false,

      settings: {},
      settingsSchema: def.settingsSchema,
      locales: def.locales ?? [],
      requirements: def.requirements ?? [],

      active: true
    }))

    return [...existingWidgets, ...extraDefaults]
  },

  async saveUserDashboard(widgets: IDashboardWidgetItem[]): Promise<void> {
    if (!widgets.length) throw new Error('No widgets provided')

    await db.delete(widgetTable).run()

    const inserts = widgets.map((w) => ({
      id: w.id,
      definitionId: w.id,
      layout: w.layout,
      static: w.static ?? false,
      settings: w.settings ?? {},
      active: w.active ?? true
    }))

    await db.insert(widgetTable).values(inserts).run()
  },

  async addWidget(widgetId: string): Promise<void> {
    const [existing, def] = await Promise.all([
      db.select().from(widgetTable).where(eq(widgetTable.id, widgetId)),
      db
        .select()
        .from(defTable)
        .where(eq(defTable.id, widgetId))
        .then((res) => res[0])
    ])

    if (existing.length > 0) return // skip duplicates
    if (!def) throw new Error(`Widget definition ${widgetId} not found`)

    await db
      .insert(widgetTable)
      .values({
        id: def.id,
        definitionId: def.id,
        layout: {}, // default empty, can be enhanced
        static: false,
        settings: {},
        active: true
      })
      .run()
  },

  async removeWidget(widgetId: string): Promise<void> {
    const existing = await db
      .select()
      .from(widgetTable)
      .where(eq(widgetTable.id, widgetId))

    if (existing.length === 0) return // nothing to remove
    if (existing[0].definitionId !== widgetId) {
      throw new Error(
        `Widget ${widgetId} does not match its definition ID ${existing[0].definitionId}`
      )
    }

    await db
      .update(widgetTable)
      .set({ active: false })
      .where(eq(widgetTable.id, widgetId))
      .run()
  }
}
