import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { useNoteStore } from '../../core/store/note.store'
import { Editor, EditorContainer } from '@manager/ui/src/ui/editor'
import { Plate } from '@udecode/plate/react'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { useDebounce } from '@manager/ui/src/hooks/use-debounce'
import { useCreateEditor } from '@manager/ui/src/core/editor/use-create-editor'

export const Route = createFileRoute('/notes/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id }: { id: number } = useParams({ strict: true, from: '/notes/$id' })
  const { currentNote, getNote, updateNote } = useNoteStore()

  const [value, setValue] = useState<any[] | null>(null)
  const debouncedValue = useDebounce(value, 500)

  //const editor = usePlateEditor({ skipInitialization: true })
  const editor = useCreateEditor({
    skipInitialization: true
  })

  // Track currently loaded note ID to compare with debounced saves
  const loadedNoteId = useRef<number | null>(null)

  // Load note when route ID changes
  useEffect(() => {
    if (!id) return

    getNote(id)
  }, [id])

  // Set initial value when note is loaded
  useEffect(() => {
    if (currentNote && Array.isArray(currentNote.content)) {
      loadedNoteId.current = currentNote.id
      setValue(currentNote.content)

      // Initialize editor
      editor.tf.init({
        value: currentNote.content,
        autoSelect: 'end'
      })
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
      loadedNoteId.current === currentNote.id && // safeguard against race condition
      Array.isArray(currentNote.content) &&
      JSON.stringify(debouncedValue) !== JSON.stringify(currentNote.content)
    ) {
      console.log('Auto-saving note:', currentNote.id)
      console.log('Debounced value:', debouncedValue)
      console.log('Current note content:', currentNote.content)

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
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-8">
        <div className="max-w-4xl mx-auto">
          <Plate
            editor={editor}
            onValueChange={(newValue) => {
              setValue(newValue.value)
            }}
          >
            <EditorContainer>
              <Editor placeholder="Start writing your note here..." />
            </EditorContainer>
          </Plate>
        </div>
      </div>
    </div>
  )
}
