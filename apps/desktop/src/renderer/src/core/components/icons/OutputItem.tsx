import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { IOutput } from '@shared/types/image/image'
import { X } from 'lucide-react'
import { FC } from 'react'

interface Props {
  output: IOutput
  index: number
  onUpdate: (index: number, updated: IOutput) => void
  onRemove: (index: number) => void
}

export const OutputItem: FC<Props> = ({
  output,
  index,
  onUpdate,
  onRemove
}) => {
  return (
    <div className="flex items-center gap-2 border p-3 rounded-lg w-full">
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          min={1}
          value={output.width}
          onChange={(e) =>
            onUpdate(index, { ...output, width: +e.target.value })
          }
          className="w-20"
          placeholder="Width"
        />
        <span className="text-muted-foreground">x</span>
        <Input
          type="number"
          min={1}
          value={output.height}
          onChange={(e) =>
            onUpdate(index, { ...output, height: +e.target.value })
          }
          className="w-20"
          placeholder="Height"
        />
      </div>

      <Select
        value={output.format}
        onValueChange={(value) =>
          onUpdate(index, { ...output, format: value as IOutput['format'] })
        }
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ico">ICO</SelectItem>
          <SelectItem value="icns">ICNS</SelectItem>
          <SelectItem value="png">PNG</SelectItem>
        </SelectContent>
      </Select>

      <Button
        className="ml-auto"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
      >
        <X className="text-destructive" />
      </Button>
    </div>
  )
}
