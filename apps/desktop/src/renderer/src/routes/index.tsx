import { News } from '@renderer/core/components/news'
import { FeaturedMatches } from '@renderer/core/components/sports/featured-matches'
import { SystemWidget } from '@renderer/core/components/system/system-widget'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSystemStore } from '../core/store/system.store'
import { useDashboardStore } from '../core/store/dashboard.store'
import { YrCard } from '../core/components/admin-widgets/yr-card'

const WorkspaceManagementPage = () => {
  const { subscribeToSystemStatistics, unsubscribeFromSystemStatistics } =
    useSystemStore()

  const { fetchNews } = useDashboardStore()

  useEffect(() => {
    subscribeToSystemStatistics()
    void fetchNews()

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
