import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@manager/ui/ui/select'
import { WidgetSetting } from '@manager/common'
import { Input, Textarea, Label, Switch } from '@manager/ui'

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
                defaultChecked={setting.default ?? false}
              />
            )}

            {setting.type === 'text' && (
              <Input
                type="text"
                placeholder={setting.placeholder}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                defaultValue={setting.default ?? ''}
              />
            )}

            {setting.type === 'number' && (
              <Input
                type="number"
                min={setting.min}
                max={setting.max}
                value={value}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                defaultValue={setting.default ?? ''}
              />
            )}

            {setting.type === 'select' && (
              <Select
                value={value}
                onValueChange={(val) => handleChange(key, val)}
                defaultValue={setting.default ?? ''}
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
                defaultValue={(setting.default || []).join(', ')}
              />
            )}

            {setting.type === 'date' && (
              <Input
                type="date"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                defaultValue={setting.default ?? ''}
              />
            )}

            {setting.type === 'datetime' && (
              <Input
                type="datetime-local"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                defaultValue={setting.default ?? ''}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
