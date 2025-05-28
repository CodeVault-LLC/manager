import { createFileRoute, Link } from '@tanstack/react-router'
import { useNoteStore } from '../../core/store/note.store'
import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@manager/ui'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

export const Route = createFileRoute('/notes/')({
  component: RouteComponent
})

function RouteComponent() {
  const { notes, getAll, createNote } = useNoteStore()

  useEffect(() => {
    if (notes.length === 0) {
      getAll()
    }
  }, [])

  const handleCreateNote = async () => {
    await createNote()
    getAll()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Notes</h1>
        <Button onClick={handleCreateNote}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No notes available.</p>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notes.map((note) => (
            <Link
              to="/notes/$id"
              params={{ id: note.id.toString() }}
              key={note.id}
              className="block py-4 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {note.title || 'Untitled'}
                  </h3>
                </div>
                <div className="text-sm text-gray-400 mt-2 sm:mt-0 sm:text-right">
                  {note.createdAt
                    ? formatDistanceToNow(new Date(note.createdAt), {
                        addSuffix: true,
                        locale: nb
                      })
                    : ''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
