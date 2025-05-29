import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { useNoteStore } from '../../core/store/note.store'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { useDebounce } from '@manager/ui/src/hooks/use-debounce'
import { Editor } from '@manager/ui/src/core/editor/editor'

export const Route = createFileRoute('/notes/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id }: { id: number } = useParams({ strict: true, from: '/notes/$id' })
  const { currentNote, getNote, updateNote } = useNoteStore()

  const [value, setValue] = useState<object | null>(
    currentNote?.content || null
  )
  const debouncedValue = useDebounce(value, 500)

  // Track currently loaded note ID to compare with debounced saves
  const loadedNoteId = useRef<number | null>(null)

  // Load note when route ID changes
  useEffect(() => {
    if (!id) return

    getNote(id)
  }, [id])

  // Set initial value when note is loaded
  useEffect(() => {
    if (currentNote) {
      loadedNoteId.current = currentNote.id
      setValue(currentNote.content)

      // Initialize editor
    }
  }, [currentNote])

  // Save only if:
  // - A note is loaded
  // - The debounced value changed
  // - The currentNote hasn't changed in between (using loadedNoteId)
  useEffect(() => {
    if (
      currentNote &&
      currentNote?.id &&
      debouncedValue &&
      loadedNoteId.current !== null &&
      loadedNoteId.current === currentNote.id &&
      JSON.stringify(debouncedValue) !== JSON.stringify(currentNote.content)
    ) {
      updateNote({
        id: currentNote.id,
        title: currentNote.title || '',
        content: debouncedValue
      })
    }
  }, [debouncedValue])

  if (!currentNote) {
    return <div className="p-6 text-gray-500">Loading note...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navbar */}
      <div className="flex items-center justify-between border-b px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/notes"
            className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            {currentNote.title || 'Untitled'}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          {currentNote.updatedAt && (
            <span>
              Last edited{' '}
              {new Date(currentNote.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
          <button className="hover:text-black dark:hover:text-white transition">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 px-4 sm:px-10 py-8">
        <Editor value={value} onValueChange={setValue} onSave={() => {}} />
      </div>
    </div>
  )
}
