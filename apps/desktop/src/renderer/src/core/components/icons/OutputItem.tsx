import { X } from 'lucide-react'
import { FC } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input,
  Switch,
  Label
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
    <div className="flex flex-wrap md:flex-nowrap items-center gap-4 border p-4 rounded-xl w-full shadow-sm">
      {/* Width x Height */}
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

      {/* Format Dropdown */}
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
          <SelectItem value="webp">WEBP</SelectItem>
          <SelectItem value="avif">AVIF</SelectItem>
          <SelectItem value="tiff">TIFF</SelectItem>
          <SelectItem value="tga">TGA</SelectItem>
          <SelectItem value="ppm">PPM</SelectItem>
        </SelectContent>
      </Select>

      {/* Grayscale Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id={`grayscale-${index}`}
          checked={output.grayscale ?? false}
          onCheckedChange={(val) =>
            onUpdate(index, { ...output, grayscale: val })
          }
        />
        <Label htmlFor={`grayscale-${index}`} className="text-sm">
          Grayscale
        </Label>
      </div>

      {/* Preserve Aspect Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id={`aspect-${index}`}
          checked={output.preserve_aspect ?? false}
          onCheckedChange={(val) =>
            onUpdate(index, { ...output, preserve_aspect: val })
          }
        />
        <Label htmlFor={`aspect-${index}`} className="text-sm">
          Preserve Aspect
        </Label>
      </div>

      {/* Remove Button */}
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
