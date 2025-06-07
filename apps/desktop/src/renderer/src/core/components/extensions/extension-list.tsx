import { useSystemStore } from '@renderer/core/store/system.store'
import { FC, useEffect } from 'react'

import { Button, Separator } from '@manager/ui'

type ExtensionListProps = {
  marketplace?: boolean
}

export const ExtensionList: FC<ExtensionListProps> = (props) => {
  const { extensions, getExtensions } = useSystemStore()

  useEffect(() => {
    getExtensions(props.marketplace)
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {extensions.map((extension) => (
        <div className="border rounded-xl p-3" key={extension.name}>
          <div className="flex flex-row items-center justify-between gap-2">
            {'ICON'}
          </div>

          <h2 className="mt-2 font-medium">{extension.name}</h2>

          <p className="text-sm text-gray-500 font-medium mt-1">
            {extension.description}
          </p>

          <>
            <Separator className="my-2" />

            <div className="flex flex-row items-center justify-between">
              {false && (
                <Button
                  variant="outline"
                  size={'sm'}
                  className="flex flex-row items-center"
                >
                  Settings
                </Button>
              )}
            </div>
          </>
        </div>
      ))}
    </div>
  )
}
