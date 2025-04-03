import { NoteSidebar } from '@renderer/core/components/note/note-list'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useNotes } from '@renderer/hooks/use-notes'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react'

const NotesPage = observer(() => {
  const { selectedNoteId, setSelectedNoteId } = useNotes()

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <NoteSidebar />
    </AuthenticationWrapper>
  )
})

export const Route = createFileRoute('/notes/')({
  component: NotesPage
})
