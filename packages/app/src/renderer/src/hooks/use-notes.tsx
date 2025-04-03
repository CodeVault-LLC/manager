import { useContext } from 'react'
import { StoreContext } from '@renderer/utils/store-context'
import { INoteStore } from '@renderer/core/store/notes.store'

export const useNotes = (): INoteStore => {
  const context = useContext(StoreContext)
  if (context === undefined) throw new Error('useUser must be used within StoreProvider')
  return context.notes
}
