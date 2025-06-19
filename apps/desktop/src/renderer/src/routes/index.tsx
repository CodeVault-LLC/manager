import { News } from '@renderer/core/components/news'
import { FeaturedMatches } from '@renderer/core/components/sports/featured-matches'
import { SystemWidget } from '@renderer/core/components/system/system-widget'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSystemStore } from '../core/store/system.store'
import { YrCard } from '../core/components/admin-widgets/yr-card'
import { useShallow } from 'zustand/react/shallow'

const WorkspaceManagementPage = () => {
  const { subscribeToSystemStatistics, unsubscribeFromSystemStatistics } =
    useSystemStore(
      useShallow((state) => ({
        subscribeToSystemStatistics: state.subscribeToSystemStatistics,
        unsubscribeFromSystemStatistics: state.unsubscribeFromSystemStatistics
      }))
    )

  useEffect(() => {
    subscribeToSystemStatistics()

    return () => {
      unsubscribeFromSystemStatistics() // Uncomment if you have an unsubscribe function
    }
  }, [])

  return (
    <div className="flex flex-col p-4 gap-4">
      <SystemWidget />

      <News />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <FeaturedMatches />

        <YrCard />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: WorkspaceManagementPage
})
