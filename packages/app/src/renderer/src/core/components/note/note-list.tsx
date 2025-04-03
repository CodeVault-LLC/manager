import { useNotes } from '@renderer/hooks/use-notes'
import { observer } from 'mobx-react'

export const NoteSidebar = observer(() => {
  const { notes } = useNotes()

  return <div></div>
})
