import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSystemStore } from '../../core/store/system.store'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  ScrollArea,
  Skeleton,
  Typography
} from '@manager/ui'
import { Loader } from '../../core/components/loader/loading-spinner'
import { useI18n } from '../../hooks/use-i18n'
import { formatStorageLabel, formatStorage } from '@manager/core/utils/storage'
import {
  CpuIcon,
  DatabaseIcon,
  GpuIcon,
  InfoIcon,
  MemoryStickIcon
} from 'lucide-react'

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
        <Card className="rounded-md">
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-2">
                <DatabaseIcon className="size-4" />
                <Typography
                  variant="small"
                  className="uppercase tracking-wide text-muted-foreground"
                >
                  {t('system.statistics.storage')}
                </Typography>
              </div>
              <div className="flex items-center gap-x-2">
                {system?.storage !== undefined ? (
                  <div className="flex flex-col gap-8">
                    <Typography variant="h6">
                      {formatStorageLabel(system?.storage.total)}
                    </Typography>

                    <Typography
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {formatStorageLabel(system?.storage.used)} of{' '}
                      {formatStorageLabel(system?.storage.total)} used
                    </Typography>
                  </div>
                ) : (
                  <Loader className="size-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPU */}
        <Card className="rounded-md">
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-2">
                <GpuIcon className="size-4" />
                <Typography
                  variant="small"
                  className="uppercase tracking-wide text-muted-foreground"
                >
                  {t('system.statistics.gpu')}
                </Typography>
              </div>
              <div className="mt-1 flex items-center gap-x-2">
                {system?.storage !== undefined ? (
                  <div className="flex flex-col gap-8">
                    <Typography variant="h6">
                      {formatStorage(system?.graphics.memory ?? 0)} GB
                    </Typography>

                    <Typography
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {system.graphics.model}
                    </Typography>
                  </div>
                ) : (
                  <Loader className="size-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RAM */}
        <Card className="rounded-md">
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-2">
                <MemoryStickIcon className="size-4" />
                <Typography
                  variant="small"
                  className="uppercase tracking-wide text-muted-foreground"
                >
                  {t('system.statistics.ram')}
                </Typography>
              </div>
              <div className="mt-1 flex items-center gap-x-2">
                {system?.storage !== undefined ? (
                  <div className="flex flex-col gap-8">
                    <Typography variant="h6">
                      {formatStorage(system?.ram.total, 'ram')}
                    </Typography>

                    <Typography
                      variant="small"
                      className="text-muted-foreground"
                    >
                      Speed: {system.memoryLayout[0].clockSpeed} MHz
                    </Typography>
                  </div>
                ) : (
                  <Loader className="size-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processor */}
        <Card className="rounded-md">
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-2">
                <CpuIcon className="size-4" />
                <Typography
                  variant="small"
                  className="uppercase tracking-wide text-muted-foreground"
                >
                  {t('system.statistics.processor')}
                </Typography>
              </div>
              <div className="mt-1 flex items-center gap-x-2">
                {system?.storage !== undefined ? (
                  <div className="flex flex-col gap-8">
                    <Typography variant="h6">
                      {system.processor.brand}
                    </Typography>

                    <Typography
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {system.processor.speed} GHz
                    </Typography>
                  </div>
                ) : (
                  <Loader className="size-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Card className="rounded-md">
          <CardContent className="pt-4 flex flex-row items-center gap-2">
            <div className="flex flex-col">
              <Typography variant="h6">{system.computername}</Typography>
              <Typography variant="span">Komplett PC</Typography>
            </div>

            <Button variant="outline" size="sm" className="ml-auto">
              Rename this PC
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-md w-full">
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="device-specifications">
                <AccordionTrigger className="flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center gap-2">
                    <InfoIcon className="size-5" />
                    <Typography>Device Specifications</Typography>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col">
                    <Typography
                      variant="strong"
                      className="text-muted-foreground"
                    >
                      {t('system.statistics.device')}
                    </Typography>
                    <Typography
                      variant="strong"
                      className="text-muted-foreground"
                    >
                      {t('system.statistics.device.model')}: qwe
                    </Typography>
                    <Typography
                      variant="strong"
                      className="text-muted-foreground"
                    >
                      {t('system.statistics.device.serial')}: asd
                    </Typography>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
