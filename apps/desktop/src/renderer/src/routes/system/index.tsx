import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSystemStore } from '../../core/store/system.store'
import { Card, CardContent, Progress, ScrollArea, Skeleton } from '@manager/ui'
import { Loader } from '../../core/components/loader/loading-spinner'
import { useI18n } from '../../hooks/use-i18n'

export const Route = createFileRoute('/system/')({
  component: RouteComponent
})

function RouteComponent() {
  const { t } = useI18n()
  const { system, getSystem } = useSystemStore()

  useEffect(() => {
    getSystem()
  }, [getSystem])

  if (!system) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid sm:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4 sm:gap-6 w-full lg:grid-cols-4 xl:grid-cols-4">
        {/* Storage */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('system.statistics.storage')}
              </p>
              <div className="mt-1 flex items-center gap-x-2">
                {system?.storage !== undefined ? (
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg sm:text-2xl font-medium">
                      {system.storage.used.toFixed(2)}%
                    </h3>
                  </div>
                ) : (
                  <Loader className="size-6" />
                )}
              </div>
              <Progress value={system?.storage.used} className="mt-6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
