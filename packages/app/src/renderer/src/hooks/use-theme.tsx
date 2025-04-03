import { useContext } from 'react'
// store
import { StoreContext } from '@renderer/utils/store-context'
import { ISystemStore } from '@renderer/core/store/system.store'

export const useSystem = (): ISystemStore => {
  const context = useContext(StoreContext)
  if (context === undefined)
    throw new Error('useTheme must be used within StoreProvider')
  return context.system
}
