import { useContext } from 'react'
import { StoreContext } from '@renderer/utils/store-context'
import { IDashboardStore } from '@renderer/core/store/dashboard.store'

export const useDashboard = (): IDashboardStore => {
  const context = useContext(StoreContext)
  if (context === undefined)
    throw new Error('useDashboard must be used within StoreProvider')
  return context.dashboard
}
