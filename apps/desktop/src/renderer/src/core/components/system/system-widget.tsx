import { useSystemStore } from '@renderer/core/store/system.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { FC } from 'react'

import {
  Progress,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription
} from '@manager/ui'

import { Loader } from '../loader/loading-spinner'
import { AlertCircle } from 'lucide-react'

const formatUptime = (seconds: number) => {
  const weeks = Math.floor(seconds / 604800)
  const days = Math.floor((seconds % 604800) / 86400)
  const hrs = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.round(seconds % 60)

  const formattedUptime: string[] = []
  if (weeks > 0) formattedUptime.push(`${weeks}w`)
  if (days > 0) formattedUptime.push(`${days}d`)
  if (hrs > 0) formattedUptime.push(`${hrs}h`)
  if (mins > 0) formattedUptime.push(`${mins}m`)
  if (secs > 0) formattedUptime.push(`${secs}s`)

  return formattedUptime.join(' ')
}

export const SystemWidget: FC = () => {
  const { t } = useI18n()
  const { systemStatistics } = useSystemStore()

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4 sm:gap-6 w-full lg:grid-cols-4 xl:grid-cols-4">
      {/* CPU */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('system.statistics.cpuUsage')}
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.cpu !== undefined ? (
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg sm:text-2xl font-medium">
                    {systemStatistics.cpu.current.toFixed(2)}%
                  </h3>

                  <span className="text-xs text-muted-foreground">
                    Average {systemStatistics.cpu.average.toFixed(2)}%
                  </span>
                </div>
              ) : (
                <Loader className="size-6" />
              )}
            </div>
            <Progress value={systemStatistics?.cpu.current} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      {/* Memory */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('system.statistics.memoryUsage')}
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.memory !== undefined ? (
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg sm:text-2xl font-medium">
                    {systemStatistics.memory.current.toFixed(2)}%
                  </h3>

                  <span className="text-xs text-muted-foreground">
                    Average {systemStatistics.memory.average.toFixed(2)}%
                  </span>
                </div>
              ) : (
                <Loader className="size-6" />
              )}
            </div>
            <Progress
              value={systemStatistics?.memory.current}
              className="mt-6"
            />
          </div>
        </CardContent>
      </Card>

      {/* Disk */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('system.statistics.diskUsage')}
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.disk !== undefined ? (
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg sm:text-2xl font-medium">
                    {systemStatistics.disk.current.toFixed(2)}%
                  </h3>

                  <span className="text-xs text-muted-foreground">
                    Average {systemStatistics.disk.average.toFixed(2)}%
                  </span>
                </div>
              ) : (
                <Loader className="size-6" />
              )}
            </div>
            <Progress value={systemStatistics?.disk.current} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('system.statistics.uptime')}
            </p>

            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.uptime !== undefined ? (
                <h3 className="text-lg sm:text-2xl font-medium">
                  {formatUptime(systemStatistics.uptime)}
                </h3>
              ) : (
                <Loader className="size-6" />
              )}
            </div>

            {/* Uptime warning */}
            {systemStatistics?.uptime !== undefined &&
              systemStatistics.uptime > 7 * 24 * 3600 && (
                <Alert
                  variant="warning"
                  className="mt-4 border-yellow-400 bg-yellow-50 text-yellow-700"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">
                    {t('system.uptime.runningForLongTime')}
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {t('system.uptime.uptimeLongTimeSuggestion')}
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
