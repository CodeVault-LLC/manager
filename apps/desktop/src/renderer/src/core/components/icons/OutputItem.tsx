import { X } from 'lucide-react'
import { FC } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input
} from '@manager/ui'
import { IOutput } from '@manager/common/src'

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
          <SelectItem value="jpg">JPG</SelectItem>
          <SelectItem value="jpeg">JPEG</SelectItem>
          <SelectItem value="bmp">BMP</SelectItem>
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
