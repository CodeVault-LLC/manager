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
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Manage Widgets
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((widget) => (
              <div
                key={widget.id}
                className={
                  'p-4 border rounded-lg flex flex-col items-center justify-between w-full gap-2'
                }
              >
                <div>
                  <h3 className="font-semibold">{widget.id}</h3>
                  <Badge variant={widget.active ? 'success' : 'destructive'}>
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
