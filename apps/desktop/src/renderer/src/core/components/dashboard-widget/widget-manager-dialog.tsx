import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Separator
} from '@manager/ui'
import { ScrollArea } from '@manager/ui/src/ui/scroll-area'
import { Plus, Trash2, Settings } from 'lucide-react'
import { useState } from 'react'
import { useApplicationStore } from '../../store/application.store'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@manager/ui/src/utils/helpers'
import { WidgetSettingsForm } from './widget-settings-form'

type Props = {
  onToggle: (id: string, active: boolean) => void
  onUpdateSettings?: (id: string, settings: Record<string, any>) => void
}

export function WidgetManagerDialog({ onToggle, onUpdateSettings }: Props) {
  const { widgets } = useApplicationStore(
    useShallow((state) => ({
      widgets: state.widgets
    }))
  )

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null)
  const [settingsDraft, setSettingsDraft] = useState('')

  const filtered = widgets.filter(
    (widget) =>
      widget.name?.toLowerCase().includes(search.toLowerCase()) ||
      widget.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenSettings = (widgetId: string, currentSettings: any) => {
    setSettingsOpen(widgetId)
    setSettingsDraft(JSON.stringify(currentSettings ?? {}, null, 2))
  }

  const handleSaveSettings = () => {
    if (!settingsOpen) return

    try {
      const parsed = JSON.parse(settingsDraft)
      onUpdateSettings?.(settingsOpen, parsed)
      setSettingsOpen(null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Invalid JSON in settings')
    }
  }

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

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Dashboard Widgets</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search widgets by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="my-4"
        />

        <ScrollArea className="h-[60vh] pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {filtered.map((widget) => (
              <div
                key={widget.id}
                className="p-4 border rounded-xl shadow-sm flex flex-col justify-between gap-3 bg-background hover:shadow-md transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{widget.name}</h3>
                    <Badge
                      variant="outline"
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

                  <p className="text-muted-foreground text-sm">
                    {widget.description || 'No description provided.'}
                  </p>

                  <Badge
                    variant="secondary"
                    className="text-xs mt-1 capitalize w-fit"
                  >
                    {widget.type || 'unknown'}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleOpenSettings(widget.id, widget.settings)
                    }
                    disabled={
                      !widget.settingsSchema ||
                      !Object.keys(widget.settingsSchema).length
                    }
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
                  </Button>

                  <Button
                    variant={widget.active ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => onToggle(widget.id, !widget.active)}
                  >
                    {widget.active ? (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>

      {settingsOpen && (
        <Dialog open={true} onOpenChange={() => setSettingsOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Widget Settings</DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[65vh] pr-2">
              <WidgetSettingsForm
                schema={
                  widgets.find((w) => w.id === settingsOpen)?.settingsSchema ??
                  {}
                }
                initialSettings={
                  widgets.find((w) => w.id === settingsOpen)?.settings ?? {}
                }
                onChange={(updated) =>
                  setSettingsDraft(JSON.stringify(updated))
                }
              />
            </ScrollArea>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setSettingsOpen(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
