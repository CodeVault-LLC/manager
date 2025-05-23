import { Button } from '@renderer/components/ui/button'
import { IOutput } from '@shared/types/image/image'
import { Plus, Trash2Icon } from 'lucide-react'
import { FC } from 'react'

import { OutputItem } from './OutputItem'

interface Props {
  outputs: IOutput[]
  setOutputs: React.Dispatch<React.SetStateAction<IOutput[]>>
}

export const OutputList: FC<Props> = ({ outputs, setOutputs }) => {
  const updateOutput = (index: number, updated: IOutput) =>
    setOutputs((prev) => prev.map((o, i) => (i === index ? updated : o)))

  const removeOutput = (index: number) =>
    setOutputs((prev) => prev.filter((_, i) => i !== index))

  const clearOutputs = () => setOutputs([])

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
        <div className="flex flex-row items-center gap-2">
          {outputs.length > 0 && (
            <Button variant="destructive" size="sm" onClick={clearOutputs}>
              <Trash2Icon className="mr-2 size-4" />
              Clear Outputs
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={addOutput}>
            <Plus className="mr-2 size-4" />
            Add Output
          </Button>
        </div>
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
