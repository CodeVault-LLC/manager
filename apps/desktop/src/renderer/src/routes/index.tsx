import { useEffect, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { News } from '@renderer/core/components/news'
import { FeaturedMatches } from '@renderer/core/components/sports/featured-matches'
import { SystemWidget } from '@renderer/core/components/system/system-widget'
import { YrCard } from '../core/components/admin-widgets/yr-card'
import { useSystemStore } from '../core/store/system.store'
import { useShallow } from 'zustand/react/shallow'
import { createFileRoute } from '@tanstack/react-router'

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@manager/ui'

import { Settings } from 'lucide-react'
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

  const layout = widgets
    .filter((widget) => widget.active)
    .map((widget) => ({
      i: widget.id,
      x: widget.x || 0,
      y: widget.y || 0,
      w: widget.w || 2,
      h: widget.h || 2,
      static: widget.static || false
    }))

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
      {/* Floating settings button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="rounded-full shadow-lg h-12 w-12 p-0"
              variant="secondary"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {widgets.map((widget) => (
              <DropdownMenuCheckboxItem
                key={widget.id}
                checked={widget.active}
                onCheckedChange={(checked) => {
                  if (checked) {
                    void addWidget(widget.id)
                  } else {
                    updateWidgets(widgets.filter((w) => w.id !== widget.id))
                  }
                }}
              >
                {widget.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="rounded-full shadow-lg h-10 px-4 text-sm"
          variant={editorMode ? 'default' : 'outline'}
          onClick={() => setEditorMode(!editorMode)}
        >
          {editorMode ? 'Exit Editor' : 'Edit Mode'}
        </Button>
      </div>

      <WidgetManagerDialog
        widgets={widgets.map((w) => ({
          id: w.id,
          name: w.id.replace(/_/g, ' ').toUpperCase(),
          category: 'General', // or something more dynamic
          active: true
        }))}
        onToggle={(id, active) => {
          if (active) void addWidget(id)
          else updateWidgets(widgets.filter((w) => w.id !== id))
        }}
      />

      {/* Dashboard grid */}
      <div
        className="overflow-auto"
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1024, md: 768, sm: 480 }}
          cols={{ lg: 6, md: 4, sm: 2 }}
          rowHeight={60}
          isDraggable={editorMode}
          isResizable={false}
          margin={[4, 4]}
          useCSSTransforms={true}
          compactType={null}
          preventCollision={true}
          onLayoutChange={(newLayout) => {
            const updatedWidgets = newLayout.map((item) => ({
              id: item.i,
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
              static: item.static || false
            }))
            updateWidgets(updatedWidgets)
          }}
          resizeHandles={['se']}
          onDragStart={() => {
            if (!editorMode) {
              setEditorMode(true)
            }
          }}
          onResizeStart={() => {
            if (!editorMode) {
              setEditorMode(true)
            }
          }}
          onDragStop={() => {
            if (!editorMode) {
              setEditorMode(false)
            }
          }}
          onResizeStop={(_, __, newItem) => {
            const updatedWidgets = widgets.map((widget) =>
              widget.id === newItem.i
                ? {
                    ...widget,
                    x: newItem.x,
                    y: newItem.y,
                    w: newItem.w,
                    h: newItem.h
                  }
                : widget
            )
            updateWidgets(updatedWidgets)
          }}
        >
          {layout.map((item) => {
            const widgetKey = item.i
            const widgetData = combinedWidgets[widgetKey]

            if (!widgetData) return null

            return (
              <div
                key={item.i}
                data-grid={item}
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
