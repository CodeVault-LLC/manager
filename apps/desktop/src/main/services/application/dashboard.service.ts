import { IDashboardWidgetItem } from '@manager/common/src'
import { db } from '../../database/data-source'
import { widgets } from '../../database/models/schema'

const global_widgets = [
  {
    id: 'basic_system_statistics',
    type: 'system',
    w: 6,
    h: 2,
    x: 0,
    y: 0,
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
    settings: {},
    active: true
  }
]

export const DashboardService = {
  getDefaultWidgets(): IDashboardWidgetItem[] {
    return global_widgets
      .map((widget) => {
        if (!widget.active) {
          return null
        }

        return {
          id: widget.id,
          type: widget.type,
          x: widget.x || 0,
          y: widget.y || 0,
          w: widget.w || 2,
          h: widget.h || 2,
          static: false,
          active: widget.active,
          settings: widget.settings || {}
        }
      })
      .filter(Boolean) as IDashboardWidgetItem[]
  },

  async getUserDashboard(): Promise<IDashboardWidgetItem[]> {
    const widgets = await db.query.widgets.findMany()

    if (!widgets || widgets.length === 0) {
      return this.getDefaultWidgets()
    }

    return widgets.map((widget) => ({
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

  async saveUserDashboard(
    requested_widgets: IDashboardWidgetItem[]
  ): Promise<void> {
    const globalWidgetMap = new Map(
      global_widgets.map((widget) => [
        widget.id,
        {
          type: widget.type,
          w: widget.w || 2,
          h: widget.h || 2
        }
      ])
    )

    const updatedWidgets = requested_widgets
      .map((widget) => {
        const globalType = globalWidgetMap.get(widget.id)
        if (globalType) {
          return {
            ...widget,
            type: globalType.type,
            w: globalType.w || widget.w || 2,
            h: globalType.h || widget.h || 2
          }
        } else {
          return null
        }
      })
      .filter(Boolean) as IDashboardWidgetItem[]

    const widgetInserts = updatedWidgets.map((widget) => ({
      id: widget.id,
      type: widget.type,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      static: widget.static ?? false, // Use boolean as expected by schema
      settings: widget.settings || {},
      active: true
    }))

    if (widgetInserts.length === 0) {
      throw new Error('No valid widgets to save')
    }

    log.info(`Saving ${widgetInserts.length} widgets to user dashboard`)
    widgetInserts.forEach((widget) => {
      log.info(
        `Widget: ${widget.id}, Type: ${widget.type}, Position: (${widget.x}, ${widget.y}), Size: (${widget.w}x${widget.h})`
      )
    })

    await db.delete(widgets).run()

    await db.insert(widgets).values(widgetInserts).run()
  },

  async addWidget(widgetId: string): Promise<void> {
    const existingWidgets = await this.getUserDashboard()
    const widgetExists = existingWidgets.some((w) => w.id === widgetId)

    if (widgetExists) {
      throw new Error(`Widget with ID ${widgetId} already exists`)
    }

    const defaultWidget = global_widgets.find((w) => w.id === widgetId)

    if (!defaultWidget) {
      throw new Error(`No default widget found for ID ${widgetId}`)
    }

    const newWidget: IDashboardWidgetItem = {
      id: defaultWidget.id,
      type: defaultWidget.type,
      x: 0,
      y: 0,
      w: 2,
      h: 2,
      static: false,
      settings: {},
      active: true
    }

    await this.saveUserDashboard([...existingWidgets, newWidget])
  }
}
