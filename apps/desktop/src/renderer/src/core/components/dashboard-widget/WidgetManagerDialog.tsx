import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input
} from '@manager/ui'
import { ScrollArea } from '@manager/ui/src/ui/scroll-area'
import { Plus, Trash2, Settings } from 'lucide-react'
import { useState } from 'react'
import { useApplicationStore } from '../../store/application.store'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@manager/ui/src/utils/helpers'

type Props = {
  onToggle: (id: string, active: boolean) => void
}

export function WidgetManagerDialog({ onToggle }: Props) {
  const { widgets } = useApplicationStore(
    useShallow((state) => ({
      widgets: state.widgets
    }))
  )

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = widgets.filter((widget) =>
    widget.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full shadow-lg h-12 w-12 p-0"
          variant="secondary"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dashboard Widgets</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search widgets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="my-4"
        />

        <ScrollArea className="h-[60vh] pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filtered.map((widget) => (
              <div
                key={widget.id}
                className={
                  'p-4 border rounded-lg flex flex-col items-center justify-between w-full gap-2'
                }
              >
                <div className="flex flex-row items-center justify-between w-full">
                  <h3 className="font-semibold">{widget.id}</h3>
                  <Badge
                    variant={'outline'}
                    className={cn(
                      'text-xs',
                      widget.active
                        ? 'text-green-600 border-green-600'
                        : 'text-red-600 border-red-600'
                    )}
                  >
                    {widget.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onToggle(widget.id, !widget.active)}
                  >
                    {widget.active ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
