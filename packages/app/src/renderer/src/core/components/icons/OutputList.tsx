import { FC } from 'react'
import { OutputItem } from './OutputItem'
import { Button } from '@renderer/components/ui/button'
import { Plus } from 'lucide-react'
import { IOutput } from '@shared/types/image/image'

interface Props {
  outputs: IOutput[]
  setOutputs: React.Dispatch<React.SetStateAction<IOutput[]>>
}

export const OutputList: FC<Props> = ({ outputs, setOutputs }) => {
  const updateOutput = (index: number, updated: IOutput) =>
    setOutputs((prev) => prev.map((o, i) => (i === index ? updated : o)))

  const removeOutput = (index: number) =>
    setOutputs((prev) => prev.filter((_, i) => i !== index))

  const addOutput = () =>
    setOutputs((prev) => [
      ...prev,
      { width: 512, height: 512, format: 'png', name: '512x512.png' }
    ])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Output Sizes</h3>
          <p className="text-sm text-muted-foreground">
            Define image sizes and formats to generate.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addOutput}>
          <Plus className="mr-2 size-4" />
          Add Output
        </Button>
      </div>
      <div className="space-y-2">
        {outputs.map((output, index) => (
          <OutputItem
            key={index}
            index={index}
            output={output}
            onUpdate={updateOutput}
            onRemove={removeOutput}
          />
        ))}
      </div>
    </div>
  )
}
