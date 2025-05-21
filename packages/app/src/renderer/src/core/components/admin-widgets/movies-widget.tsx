import { useDashboardStore } from '@renderer/core/store/dashboard.store'
import { FC, useEffect } from 'react'

export const MoviesWidget: FC = () => {
  const { fetchWidgetData: getWidgetData, widgets } = useDashboardStore()
  const movieWidget = widgets.find((widget) => widget.name === 'movies')

  useEffect(() => {
    getWidgetData('movies')
  }, [])

  return (
    <div className="flex flex-col gap-4" key={'movies-widget'}>
      <h2 className="text-2xl font-bold">Movies</h2>
      <p>Movies are not supported yet.</p>

      {movieWidget?.data && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold">Movies Data</h3>
          <pre>{JSON.stringify(movieWidget.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
