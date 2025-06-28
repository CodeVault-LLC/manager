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
import { WidgetManagerDialog } from '../core/components/dashboard-widget/WidgetManagerDialog'

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

  const layouts = widgets.reduce(
    (acc, widget) => {
      if (!widget.active) return acc
      for (const bp of Object.keys(breakpoints)) {
        acc[bp] = acc[bp] || []
        const bpLayout = {
          ...(widget.layout[bp] || {})
        }
        acc[bp].push({ ...bpLayout, i: widget.id, static: widget.static })
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

  console.log('Widgets:', widgets)

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
        className="overflow-auto"
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
          margin={[4, 4]}
          useCSSTransforms={true}
          compactType={null}
          preventCollision={true}
          onLayoutChange={(newLayout) => {
            if (editorMode) {
              const updatedWidgets = widgets.map((widget) => {
                const newLayoutItem = newLayout.find(
                  (item) => item.i === widget.id
                )

                if (newLayoutItem) {
                  return {
                    ...widget,
                    layout: {
                      ...widget.layout,
                      [newLayoutItem.breakpoint]: {
                        x: newLayoutItem.x,
                        y: newLayoutItem.y,
                        w: newLayoutItem.w,
                        h: newLayoutItem.h
                      }
                    }
                  }
                }
                return widget
              })
              updateWidgets(updatedWidgets)
            }
          }}
          onDragStart={() => {
            if (!editorMode) {
              setEditorMode(true)
            }
          }}
          onDragStop={() => {
            if (!editorMode) {
              setEditorMode(false)
            }
          }}
        >
          {widgets.map((item) => {
            const widgetKey = item.id
            const widgetData = combinedWidgets[widgetKey]
            if (!widgetData) return null

            const gridProps = {
              ...item.layout.md,
              i: item.id,
              static: item.static
            }

            return (
              <div
                key={item.id}
                data-grid={gridProps}
                className="border border-blue-700"
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
