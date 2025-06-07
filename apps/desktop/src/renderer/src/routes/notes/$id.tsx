import {
  createFileRoute,
  useParams,
  Link,
  useNavigate
} from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { useNoteStore } from '../../core/store/note.store'
import {
  ArrowLeft,
  MoreVertical,
  Tags,
  Users,
  Clock,
  FilePlus
} from 'lucide-react'
import { useDebounce } from '@manager/ui/src/hooks/use-debounce'
import { Editor } from '@manager/ui/src/core/editor/editor'
import { Skeleton } from '@manager/ui/src/ui/skeleton'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@manager/ui'

export const Route = createFileRoute('/notes/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id }: { id: number } = useParams({ strict: true, from: '/notes/$id' })
  const { currentNote, getNote, updateNote, deleteNote } = useNoteStore()

  const navigate = useNavigate()

  const [title, setTitle] = useState(currentNote?.title || '')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const debouncedTitle = useDebounce(title, 500)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState<object | null>(null)
  const debouncedValue = useDebounce(value, 500)
  const loadedNoteId = useRef<number | null>(null)

  useEffect(() => {
    if (!id) return
    const getData = async () => {
      const note = await getNote(id)
      loadedNoteId.current = id
      setValue(note?.content || null)
    }
    void getData()
  }, [id])

  useEffect(() => {
    if (currentNote?.title) {
      setTitle(currentNote.title)
    }
  }, [currentNote])

  useEffect(() => {
    if (
      currentNote &&
      currentNote.id &&
      debouncedValue &&
      debouncedValue !== currentNote.content
    ) {
      updateNote({
        id: currentNote.id,
        title: debouncedTitle || currentNote.title,
        content: debouncedValue
      })
    }
  }, [debouncedValue])

  useEffect(() => {
    if (currentNote && currentNote.id && debouncedTitle !== currentNote.title) {
      updateNote({
        id: currentNote.id,
        title: debouncedTitle,
        content: debouncedValue || currentNote.content
      })
    }
  }, [debouncedTitle])

  if (!currentNote) {
    return (
      <div className="p-10">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (optional for future tags, comments, versioning) */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-muted/30 p-4 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Details</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4" />
            <span className="truncate">Tags (soon)</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="truncate">Shared With (coming)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              Last edit: {new Date(currentNote.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FilePlus className="w-4 h-4" />
            <span>Attachments (future)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-background border-b shadow-sm flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              to="/notes"
              className="text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    titleInputRef.current?.blur()
                  }
                }}
                className="text-lg font-semibold bg-transparent border-none outline-none max-w-[400px] truncate"
                placeholder="Untitled Note"
                autoFocus
              />
            ) : (
              <h1
                className="text-lg font-semibold truncate max-w-[400px] cursor-pointer"
                onClick={() => setIsEditingTitle(true)}
              >
                {title || 'Untitled Note'}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {currentNote.updatedAt &&
                `Edited on ${new Date(currentNote.updatedAt).toLocaleDateString(
                  undefined,
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }
                )}`}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit title</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={async () => {
                    if (currentNote.id) {
                      await deleteNote(currentNote.id)

                      void navigate({
                        to: '/notes',
                        replace: true
                      })
                    }
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Editor Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-8">
          <Editor value={value} onValueChange={setValue} onSave={() => {}} />
        </main>
      </div>
    </div>
  )
}
