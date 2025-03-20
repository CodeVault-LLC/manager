import { useContext } from 'react'
import { StoreContext } from '@renderer/utils/store-context'
import { IErrorStore } from '@renderer/core/store/error.store'

export const useError = (): IErrorStore => {
  const context = useContext(StoreContext)
  if (context === undefined) throw new Error('useError must be used within StoreProvider')
  return context.error
}
