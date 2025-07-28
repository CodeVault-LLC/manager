import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@manager/ui'
import { Plus } from 'lucide-react'
import { FC } from 'react'

export const noteTypes = [
  {
    type: 'report',
    title: 'Advanced Report',
    description: 'Great for structured, formal reporting.',
    icon: '📊'
  },
  {
    type: 'book',
    title: 'Book Writing',
    description: 'Outline chapters and build your manuscript.',
    icon: '📖'
  },
  {
    type: 'note',
    title: 'Advanced Note',
    description: 'Powerful notes with rich content support.',
    icon: '📝'
  },
  {
    type: 'doc',
    title: 'Document',
    description: 'A traditional document editor.',
    icon: '📄'
  },
  {
    type: 'wiki',
    title: 'Wiki Page',
    description: 'Create a page for your knowledge base.',
    icon: '🌐'
  }
]

type NoteCreateDialogProps = {
  handleCreateNote: (noteType: string) => void
}

export const NoteCreateDialog: FC<NoteCreateDialogProps> = ({
  handleCreateNote
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>Select a Note Type</DialogTitle>
          <DialogDescription>
            Choose a template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {noteTypes.map((noteType) => (
            <Button
              key={noteType.type}
              variant="outline"
              className="flex flex-col items-start text-left p-4 w-full h-full min-h-[120px]"
              onClick={() => handleCreateNote(noteType.type)}
            >
              <div className="text-2xl">{noteType.icon}</div>
              <div className="font-medium mt-2">{noteType.title}</div>
              <div className="text-sm text-muted-foreground mt-1 truncate max-w-full">
                {noteType.description}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
