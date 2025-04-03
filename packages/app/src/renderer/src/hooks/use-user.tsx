import { useContext } from 'react'
import { StoreContext } from '@renderer/utils/store-context'
import { IUserStore } from '@renderer/core/store/user.store'

export const useUser = (): IUserStore => {
  const context = useContext(StoreContext)
  if (context === undefined) throw new Error('useUser must be used within StoreProvider')
  return context.user
}
