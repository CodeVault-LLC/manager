import { IDashboardWidgetItem } from '@manager/common/src'
import { db } from '../../database/data-source'
import { widgets as widgetTable } from '../../database/models/schema'
import { eq } from 'drizzle-orm'

const globalWidgets: IDashboardWidgetItem[] = [
  {
    id: 'basic_system_statistics',
    type: 'system',
    w: 6,
    h: 2,
    x: 0,
    y: 0,
    static: false,
    settings: {},
    active: true
  },
  {
    id: 'msn_news_slider',
    type: 'news',
    w: 6,
    h: 2,
    x: 0,
    y: 5,
    static: false,
    settings: {},
    active: true
  },
  {
    id: 'msn_sport_featured_matches',
    type: 'sport',
    w: 3,
    h: 2,
    x: 0,
    y: 9,
    static: false,
    settings: {},
    active: true
  },
  {
    id: 'yr_weather_card_small',
    type: 'yr',
    w: 3,
    h: 2,
    x: 3,
    y: 9,
    static: false,
    settings: {},
    active: true
  }
]

const globalMap = new Map(globalWidgets.map((w) => [w.id, w]))

export const DashboardService = {
  getDefaultWidgets(): IDashboardWidgetItem[] {
    return globalWidgets
  },

  async getUserDashboard(): Promise<IDashboardWidgetItem[]> {
    const rows = await db.select().from(widgetTable)

    if (rows.length === 0) {
      return this.getDefaultWidgets()
    }

    const existingIds = new Set(rows.map((widget) => widget.id))
    const missingWidgets = globalWidgets.filter(
      (widget) => !existingIds.has(widget.id)
    )

    if (missingWidgets.length > 0) {
      log.info(
        `Adding missing global widgets: ${missingWidgets.map((w) => w.id).join(', ')}`
      )
      rows.push(
        ...missingWidgets.map((widget) => ({
          ...widget,
          static: widget.static ?? false,
          settings: widget.settings || {},
          active: false // Default to inactive for new widgets
        }))
      )
    }

    return rows.map((widget) => ({
      id: widget.id,
      type: widget.type,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      static: widget.static ?? false,
      settings: widget.settings || {},
      active: widget.active ?? true
    }))
  },

  async saveUserDashboard(widgets: IDashboardWidgetItem[]): Promise<void> {
    if (!widgets.length) throw new Error('No widgets provided')

    const inserts = widgets.map((widget) => {
      const base = globalMap.get(widget.id)
      if (!base) throw new Error(`Unknown widget id: ${widget.id}`)

      return {
        id: widget.id,
        type: base.type,
        x: widget.x,
        y: widget.y,
        w: widget.w || base.w,
        h: widget.h || base.h,
        static: widget.static ?? false,
        settings: widget.settings || {},
        active: true
      }
    })

    // Transaction: delete old, insert new
    await db.transaction(async (tx) => {
      await tx.delete(widgetTable).run()
      await tx.insert(widgetTable).values(inserts).run()
    })
  },

  async addWidget(widgetId: string): Promise<void> {
    const existing = await this.getUserDashboard()
    if (existing.some((w) => w.id === widgetId)) {
      throw new Error(`Widget ${widgetId} already exists`)
    }

    const def = globalMap.get(widgetId)
    if (!def) throw new Error(`Widget ${widgetId} not found`)

    const newWidget: IDashboardWidgetItem = {
      id: def.id,
      type: def.type,
      x: 0,
      y: 0,
      w: def.w,
      h: def.h,
      static: false,
      settings: {},
      active: true
    }

    await this.saveUserDashboard([...existing, newWidget])
  },

  async removeWidget(widgetId: string): Promise<void> {
    await db.delete(widgetTable).where(eq(widgetTable.id, widgetId)).run()
  }
}
