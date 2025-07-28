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
import { WidgetSettingsForm } from './widget-settings-form'
import {
  IDashboardWidgetInstance,
  IDashboardWidgetItem
} from '@manager/common/src'

type Props = {
  widgets: IDashboardWidgetItem[]
  widgetInstances: IDashboardWidgetInstance[]
  onUpdateSettings?: (id: string, settings: Record<string, any>) => void
  onDisableWidgetInstance: (id: string) => void
  onAddWidgetInstance: (widget: IDashboardWidgetItem) => void
}

export function WidgetManagerDialog({
  widgets,
  widgetInstances,
  onAddWidgetInstance,
  onDisableWidgetInstance,
  onUpdateSettings
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null)
  const [settingsDraft, setSettingsDraft] = useState('')

  const handleOpenSettings = (instance: IDashboardWidgetInstance) => {
    setSettingsOpen(instance.id)
    setSettingsDraft(JSON.stringify(instance.settings ?? {}, null, 2))
  }

  const handleSaveSettings = () => {
    if (!settingsOpen) return

    try {
      const parsed = JSON.parse(settingsDraft)
      onUpdateSettings?.(settingsOpen, parsed)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert('Invalid JSON in settings')
    } finally {
      setSettingsOpen(null)
      setSettingsDraft('')
    }
  }

  const filteredWidgets = widgets.filter((w) =>
    `${w.name} ${w.id}`.toLowerCase().includes(search.toLowerCase())
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

      <DialogContent className="max-w-5xl overflow-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Dashboard Widgets</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search widgets by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="my-4"
        />

        <h4 className="text-sm font-semibold text-muted-foreground mb-1">
          Add New Widget
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {filteredWidgets.map((def) => (
            <div
              key={def.id}
              className="p-4 border rounded-xl shadow-sm bg-muted hover:bg-muted/70 transition"
            >
              <div className="flex items-start gap-4">
                {def.iconUrl && (
                  <img
                    src={def.iconUrl}
                    alt={`${def.name} icon`}
                    className="h-10 w-10 rounded"
                  />
                )}
                <div className="flex flex-col flex-1">
                  <div className="font-medium text-sm">{def.name}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {def.description}
                  </p>
                  {def.source && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Source: {def.source}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddWidgetInstance(def)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-sm font-semibold text-muted-foreground mb-1">
          Active Widget Instances
        </h4>
        <ScrollArea className="h-[50vh] pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgetInstances.map((instance) => {
              const def = widgets.find((w) => w.id === instance.definitionId)
              if (!def) {
                onDisableWidgetInstance(instance.id)

                return null
              }

              return (
                <div
                  key={instance.id}
                  className="p-4 border rounded-xl shadow bg-background flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3">
                    {def.iconUrl && (
                      <img
                        src={def.iconUrl}
                        alt=""
                        className="w-8 h-8 rounded-sm"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{def.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {instance.id}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {def.description}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] capitalize"
                    >
                      {def.type || 'Unknown'}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenSettings(instance)}
                        disabled={
                          !def.settingsSchema ||
                          !Object.keys(def.settingsSchema).length
                        }
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDisableWidgetInstance(instance.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
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
                  widgets.find(
                    (w) =>
                      w.id ===
                      widgetInstances.find((w) => w.id === settingsOpen)
                        ?.definitionId
                  )?.settingsSchema ?? {}
                }
                initialSettings={
                  widgetInstances.find((w) => w.id === settingsOpen)
                    ?.settings ?? {}
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
