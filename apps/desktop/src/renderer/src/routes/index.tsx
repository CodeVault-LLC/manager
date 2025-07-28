import { useEffect, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { News } from '@renderer/core/components/news'
import { FeaturedMatches } from '@renderer/core/components/sports/featured-matches'
import { SystemWidget } from '@renderer/core/components/system/system-widget'
import { useSystemStore } from '../core/store/system.store'
import { useShallow } from 'zustand/react/shallow'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@manager/ui'
import { useApplicationStore } from '../core/store/application.store'
import { WidgetManagerDialog } from '../core/components/dashboard-widget/widget-manager-dialog'
import {
  IDashboardWidgetInstance,
  IDashboardWidgetItem,
  WidgetSetting
} from '@manager/common/src'
import { WeatherCurrentConditionsWidget } from '../core/components/weather-current-conditions-widget/weather-current-conditions'
import { Weather7DayForecastWidget } from '../core/components/weather_forecast_7_day/weather_forecast_7_day'

const ResponsiveGridLayout = WidthProvider(Responsive)

const combinedWidgets: Record<
  string,
  { component: (props: { widgetInstanceId: string }) => JSX.Element }
> = {
  basic_system_statistics: {
    component: () => <SystemWidget />
  },
  msn_news_slider: {
    component: () => <News />
  },
  msn_sport_featured_matches: {
    component: () => <FeaturedMatches />
  },
  weather_current_conditions: {
    component: ({ widgetInstanceId }) => (
      <WeatherCurrentConditionsWidget widgetInstanceId={widgetInstanceId} />
    )
  },
  weather_forecast_7_day: {
    component: ({ widgetInstanceId }) => (
      <Weather7DayForecastWidget widgetInstanceId={widgetInstanceId} />
    )
  }
}

export const WorkspaceManagementPage = () => {
  const { widgets, widgetInstances, updateWidgetInstances } =
    useApplicationStore(
      useShallow((state) => ({
        widgets: state.widgets,
        widgetInstances: state.widgetInstances,
        updateWidgetInstances: state.updateWidgetInstances
      }))
    )

  const [editorMode, setEditorMode] = useState(false)

  const breakpoints = { lg: 1920, md: 992, sm: 767, xs: 480, xxs: 0 }
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }

  // Generate layouts object
  const layouts = widgetInstances.reduce(
    (acc, widget) => {
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

  function hasDefault(
    setting: WidgetSetting
  ): setting is WidgetSetting & { default: any } {
    return 'default' in setting
  }

  return (
    <div className="relative flex flex-col p-4 gap-4">
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <WidgetManagerDialog
          widgets={widgets}
          widgetInstances={widgetInstances}
          onDisableWidgetInstance={(id) => {
            const updatedWidgets = widgetInstances.filter(
              (widget) => widget.id !== id
            )

            updateWidgetInstances(updatedWidgets)
          }}
          onAddWidgetInstance={(widget: IDashboardWidgetItem) => {
            const widgetId = crypto.randomUUID()

            const defaultSettings: Record<string, any> = {}

            for (const [key, setting] of Object.entries(
              widget.settingsSchema
            )) {
              if (hasDefault(setting)) {
                defaultSettings[key] = setting.default
              }
            }

            const newWidgetInstance: IDashboardWidgetInstance = {
              id: widgetId,
              definitionId: widget.id,
              layout: widget.defaultLayout || {},
              settings: defaultSettings,
              static: false,
              data: null // Placeholder for future data fetching
            }

            const updatedWidgetInstances = [
              ...widgetInstances,
              newWidgetInstance
            ]

            updateWidgetInstances(updatedWidgetInstances)
          }}
          onUpdateSettings={(id, settings) => {
            const updatedWidgetInstances = widgetInstances.map((widget) =>
              widget.id === id ? { ...widget, settings } : widget
            )

            updateWidgetInstances(updatedWidgetInstances)
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
            if (!editorMode) return

            const updatedWidgetInstances = Object.keys(layoutsChanged).reduce(
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
              [...widgetInstances]
            )

            updateWidgetInstances(updatedWidgetInstances)
          }}
        >
          {widgetInstances.map((item) => {
            const widgetData = combinedWidgets[item.definitionId]
            if (!widgetData) return null

            return (
              <div
                key={item.id}
                className={`rounded overflow-hidden ${
                  editorMode ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {widgetData.component({
                  widgetInstanceId: item.id
                })}
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
