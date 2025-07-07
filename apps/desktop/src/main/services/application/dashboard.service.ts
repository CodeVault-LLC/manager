import { IDashboardWidgetItem } from '@manager/common/src'
import { db } from '../../database/data-source'
import { widgets as widgetTable } from '../../database/models/schema'
import { eq } from 'drizzle-orm'

//const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'] as const

type BreakpointLayout = {
  x: number
  y: number
  w: number
  h: number
}

export interface IDashboardWidgetLayout {
  [key: string]: {
    layout: Record<string, BreakpointLayout>
    type: string
    name: string
    description: string
  }
}

const defaultLayout: IDashboardWidgetLayout = {
  basic_system_statistics: {
    layout: {
      lg: { x: 0, y: 0, w: 12, h: 2 },
      md: { x: 0, y: 0, w: 10, h: 2 },
      sm: { x: 0, y: 0, w: 6, h: 2 },
      xs: { x: 0, y: 0, w: 4, h: 3 },
      xxs: { x: 0, y: 0, w: 2, h: 4 }
    },
    type: 'system',
    name: 'Basic System Statistics',
    description:
      'Displays basic system statistics like CPU, RAM, and Disk usage.'
  },
  msn_news_slider: {
    layout: {
      lg: { x: 0, y: 3, w: 12, h: 2 },
      md: { x: 0, y: 3, w: 10, h: 2 },
      sm: { x: 0, y: 3, w: 6, h: 2 },
      xs: { x: 0, y: 3, w: 4, h: 3 },
      xxs: { x: 0, y: 3, w: 2, h: 4 }
    },
    name: 'MSN News Slider',
    description: 'Displays a slider with the latest news from MSN.',
    type: 'news'
  },
  msn_sport_featured_matches: {
    layout: {
      lg: { x: 0, y: 6, w: 6, h: 2 },
      md: { x: 0, y: 6, w: 5, h: 2 },
      sm: { x: 0, y: 6, w: 3, h: 2 },
      xs: { x: 0, y: 6, w: 2, h: 3 },
      xxs: { x: 0, y: 6, w: 2, h: 3 }
    },
    name: 'MSN Sport Featured Matches',
    description: 'Displays featured sports matches from MSN.',
    type: 'sport'
  },
  yr_weather_card_small: {
    layout: {
      lg: { x: 6, y: 6, w: 6, h: 2 },
      md: { x: 5, y: 6, w: 5, h: 2 },
      sm: { x: 3, y: 6, w: 3, h: 2 },
      xs: { x: 2, y: 6, w: 2, h: 3 },
      xxs: { x: 0, y: 9, w: 2, h: 3 }
    },
    name: 'YR Weather Card Small',
    description: 'Displays a small weather card with current conditions.',
    type: 'yr'
  }
}

export const DashboardService = {
  getDefaultWidgets() {
    return Object.entries(defaultLayout).map(([id, def]) => ({
      id,
      type: def.type,
      layout: def.layout,
      static: false,
      settings: {},
      name: def.name,
      description: def.description,
      active: true
    }))
  },

  async getUserDashboard() {
    const rows = await db.select().from(widgetTable)

    if (rows.length === 0) return this.getDefaultWidgets()

    const ids = new Set(rows.map((r) => r.id))
    const missing = Object.keys(defaultLayout).filter((id) => !ids.has(id))

    const extraDefaults = missing.map((id) => ({
      id,
      type: defaultLayout[id].type,
      layout: defaultLayout[id].layout,
      static: false,
      name: defaultLayout[id].name,
      description: defaultLayout[id].description,
      settings: {},
      active: true
    }))

    return [
      ...rows.map((r) => ({
        id: r.id,
        type: r.type,
        layout: r.layout,
        name: defaultLayout[r.id]?.name || 'Unknown Widget',
        description:
          defaultLayout[r.id]?.description || 'No description available',
        static: r.static,
        settings: r.settings,
        active: r.active
      })),
      ...extraDefaults
    ]
  },

  async saveUserDashboard(widgets: IDashboardWidgetItem[]) {
    if (!widgets.length) throw new Error('No widgets provided')

    const inserts = widgets.map((w) => ({
      id: w.id,
      type: w.type,
      layout: w.layout,
      static: w.static,
      name: w.name,
      description: w.description,
      settings: w.settings,
      active: w.active
    }))

    await db.delete(widgetTable).run()
    await db.insert(widgetTable).values(inserts).run()
  },

  async addWidget(widgetId: string): Promise<void> {
    const widgetDef = defaultLayout[widgetId]
    if (!widgetDef) throw new Error(`Widget ${widgetId} not found`)

    const newWidget: IDashboardWidgetItem = {
      id: widgetId,
      type: widgetDef.type,
      name: widgetDef.name,
      description: widgetDef.description,
      layout: widgetDef.layout,
      static: false,
      settings: {},
      active: true
    }

    await db.insert(widgetTable).values(newWidget).run()
  },

  async removeWidget(widgetId: string): Promise<void> {
    await db.delete(widgetTable).where(eq(widgetTable.id, widgetId)).run()
  }
}
