import { useEffect, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { News } from '@renderer/core/components/news'
import { FeaturedMatches } from '@renderer/core/components/sports/featured-matches'
import { SystemWidget } from '@renderer/core/components/system/system-widget'
import { YrCard } from '../core/components/admin-widgets/yr-card'
import { useSystemStore } from '../core/store/system.store'
import { useShallow } from 'zustand/react/shallow'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@manager/ui'
import { useApplicationStore } from '../core/store/application.store'
import { WidgetManagerDialog } from '../core/components/dashboard-widget/widget-manager-dialog'

const ResponsiveGridLayout = WidthProvider(Responsive)

const combinedWidgets = {
  basic_system_statistics: {
    component: <SystemWidget />
  },
  msn_news_slider: {
    component: <News />
  },
  msn_sport_featured_matches: {
    component: <FeaturedMatches />
  },
  yr_weather_card_small: {
    component: <YrCard />
  }
}

export const WorkspaceManagementPage = () => {
  const { widgets, addWidget, updateWidgets } = useApplicationStore(
    useShallow((state) => ({
      widgets: state.widgets,
      addWidget: state.addWidget,
      updateWidgets: state.updateWidgets
    }))
  )

  const [editorMode, setEditorMode] = useState(false)

  const breakpoints = { lg: 1920, md: 992, sm: 767, xs: 480, xxs: 0 }
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

  /*const widgets: IDashboardWidgetItem[] = [
    {
      id: 'basic_system_statistics',
      type: 'system',
      description:
        'Displays basic system statistics like CPU, RAM, and Disk usage.',
      layout: {
        lg: { x: 0, y: 0, w: 12, h: 2.5 },
        md: { x: 0, y: 0, w: 10, h: 2.5 },
        sm: { x: 0, y: 0, w: 6, h: 2.5 },
        xs: { x: 0, y: 0, w: 4, h: 2.5 },
        xxs: { x: 0, y: 0, w: 2, h: 5 }
      },
      static: false,
      active: true,
      name: 'Basic System Statistics'
    },
    {
      id: 'msn_news_slider',
      type: 'news',
      description: 'Displays a slider with the latest news from MSN.',
      layout: {
        lg: { x: 0, y: 3, w: 12, h: 2.8 },
        md: { x: 0, y: 3, w: 10, h: 2.8 },
        sm: { x: 0, y: 3, w: 6, h: 2.8 },
        xs: { x: 0, y: 3, w: 4, h: 3 },
        xxs: { x: 0, y: 3, w: 2, h: 4 }
      },
      static: false,
      active: true,
      name: 'MSN News Slider'
    },
    {
      id: 'msn_sport_featured_matches',
      type: 'sport',
      description: 'Displays featured sports matches from MSN.',
      layout: {
        lg: { x: 0, y: 6, w: 5, h: 5.1 },
        md: { x: 0, y: 6, w: 5, h: 5.1 },
        sm: { x: 0, y: 6, w: 3, h: 5.1 },
        xs: { x: 0, y: 6, w: 2, h: 5.1 },
        xxs: { x: 0, y: 6, w: 2, h: 5.1 }
      },
      static: false,
      active: true,
      name: 'MSN Sport Featured Matches'
    },
    {
      id: 'yr_weather_card_small',
      type: 'weather',
      description: 'Displays a small weather card from YR.',
      layout: {
        lg: { x: 6, y: 6, w: 5, h: 5.1 },
        md: { x: 5, y: 6, w: 5, h: 5.1 },
        sm: { x: 3, y: 6, w: 3, h: 5.1 },
        xs: { x: 2, y: 6, w: 2, h: 5.1 },
        xxs: { x: 0, y: 9, w: 2, h: 5.1 }
      },
      static: false,
      active: true,
      name: 'YR Weather Card Small'
    }
  ]*/

  // Generate layouts object
  const layouts = widgets.reduce(
    (acc, widget) => {
      if (!widget.active) return acc
      for (const bp of Object.keys(breakpoints)) {
        const layout = widget.layout?.[bp]
        if (
          layout &&
          layout.x !== undefined &&
          layout.y !== undefined &&
          layout.w !== undefined &&
          layout.h !== undefined
        ) {
          acc[bp] = acc[bp] || []
          acc[bp].push({
            ...layout,
            i: widget.id,
            static: false
          })
        }
      }
      return acc
    },
    {} as Record<string, any[]>
  )

  const { subscribeToSystemStatistics, unsubscribeFromSystemStatistics } =
    useSystemStore(
      useShallow((state) => ({
        subscribeToSystemStatistics: state.subscribeToSystemStatistics,
        unsubscribeFromSystemStatistics: state.unsubscribeFromSystemStatistics
      }))
    )

  useEffect(() => {
    subscribeToSystemStatistics()
    return () => unsubscribeFromSystemStatistics()
  }, [])

  return (
    <div className="relative flex flex-col p-4 gap-4">
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <WidgetManagerDialog
          onToggle={(id, active) => {
            if (active) void addWidget(id)
            else {
              const updatedWidgets = widgets.map((widget) =>
                widget.id === id ? { ...widget, active: false } : widget
              )
              updateWidgets(updatedWidgets)
            }
          }}
          onUpdateSettings={(id, settings) => {
            const updatedWidgets = widgets.map((widget) =>
              widget.id === id ? { ...widget, settings } : widget
            )

            updateWidgets(updatedWidgets)
          }}
        />
        <Button
          className="rounded-full shadow-lg h-10 px-4 text-sm"
          variant={editorMode ? 'default' : 'outline'}
          onClick={() => setEditorMode(!editorMode)}
        >
          {editorMode ? 'Exit Editor' : 'Edit Mode'}
        </Button>
      </div>

      <div
        className="overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={60}
          isDraggable={editorMode}
          isResizable={false}
          margin={[10, 10]}
          useCSSTransforms={true}
          compactType={null}
          preventCollision={true}
          onBreakpointChange={() => {}}
          onLayoutChange={(_, layoutsChanged) => {
            console.log('Layout changed:', layoutsChanged)
            if (!editorMode) return

            const updatedWidgets = Object.keys(layoutsChanged).reduce(
              (acc, bp) => {
                layoutsChanged[bp].forEach((item) => {
                  const widget = acc.find((w) => w.id === item.i)
                  if (widget) {
                    widget.layout = {
                      ...widget.layout,
                      [bp]: {
                        x: item.x,
                        y: item.y,
                        w: item.w,
                        h: item.h
                      }
                    }
                  }
                })
                return acc
              },
              [...widgets]
            )

            updateWidgets(updatedWidgets)
          }}
        >
          {widgets.map((item) => {
            const widgetData = combinedWidgets[item.id]
            if (!widgetData) return null
            if (!item.active) return null

            return (
              <div
                key={item.id}
                className={`rounded overflow-hidden ${
                  editorMode ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {widgetData.component}
              </div>
            )
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: WorkspaceManagementPage
})
