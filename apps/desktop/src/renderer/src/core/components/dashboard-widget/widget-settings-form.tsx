import { Switch } from '@manager/ui/src/ui/switch'
import { Label } from '@manager/ui/src/ui/label'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@manager/ui/src/ui/select'
import { WidgetSetting } from '@manager/common/src'
import { Input, Textarea } from '@manager/ui'

type Props = {
  schema: Record<string, WidgetSetting>
  initialSettings?: Record<string, any>
  onChange: (settings: Record<string, any>) => void
}

export function WidgetSettingsForm({
  schema,
  initialSettings = {},
  onChange
}: Props) {
  const [formState, setFormState] =
    useState<Record<string, any>>(initialSettings)

  useEffect(() => {
    onChange(formState)
  }, [formState])

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([key, setting]) => {
        const value = formState[key] ?? ''

        return (
          <div key={key} className="space-y-1">
            <Label className="block">{setting.label}</Label>

            {setting.type === 'boolean' && (
              <Switch
                checked={!!value}
                onCheckedChange={(val) => handleChange(key, val)}
              />
            )}

            {setting.type === 'text' && (
              <Input
                type="text"
                placeholder={setting.placeholder}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}

            {setting.type === 'number' && (
              <Input
                type="number"
                min={setting.min}
                max={setting.max}
                value={value}
                onChange={(e) => handleChange(key, Number(e.target.value))}
              />
            )}

            {setting.type === 'select' && (
              <Select
                value={value}
                onValueChange={(val) => handleChange(key, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {setting.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {setting.type === 'multi-select' && (
              <Textarea
                value={(value || []).join(', ')}
                placeholder="Comma-separated values"
                onChange={(e) =>
                  handleChange(
                    key,
                    e.target.value.split(',').map((v) => v.trim())
                  )
                }
              />
            )}

            {setting.type === 'date' && (
              <Input
                type="date"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}

            {setting.type === 'datetime' && (
              <Input
                type="datetime-local"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
