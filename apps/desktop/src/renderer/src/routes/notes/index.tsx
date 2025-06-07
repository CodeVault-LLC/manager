import { createFileRoute, Link } from '@tanstack/react-router'
import { useNoteStore } from '../../core/store/note.store'
import { useEffect } from 'react'
import { Plus, FileText, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'
import {
  Input,
  Button,
  Card,
  CardHeader,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  CardContent,
  CardTitle
} from '@manager/ui'

export const Route = createFileRoute('/notes/')({
  component: RouteComponent
})

function RouteComponent() {
  const { notes, getAll, createNote, deleteNote } = useNoteStore()

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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Notes</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your notes efficiently.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Search and Sort Placeholder */}
          <Input placeholder="Search notes..." className="w-64" />
          <Button onClick={handleCreateNote}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center text-muted-foreground text-sm mt-10">
          You have no notes yet. Click “New Note” to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <Link
              to="/notes/$id"
              params={{ id: note.id.toString() }}
              key={note.id}
              className="group"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Note</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={async () => {
                          void deleteNote(note.id)
                          void getAll()
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base font-medium truncate mb-1">
                    {note.title || 'Untitled'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {note.createdAt
                      ? formatDistanceToNow(note.createdAt, {
                          addSuffix: true,
                          locale: nb
                        })
                      : 'No date'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
