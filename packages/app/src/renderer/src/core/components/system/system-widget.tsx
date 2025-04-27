import { Card, CardContent } from '@renderer/components/ui/card'
import { Progress } from '@renderer/components/ui/progress'
import { FC } from 'react'
import { LoadingSpinner } from '../loader/loading-spinner'
import { observer } from 'mobx-react'
import { useSystem } from '@renderer/hooks'
import { useI18n } from '@renderer/hooks/use-i18n'

const formatUptime = (seconds: number) => {
  const weeks = Math.floor(seconds / 604800)
  const days = Math.floor((seconds % 604800) / 86400)
  const hrs = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const formattedUptime: string[] = []
  if (weeks > 0) formattedUptime.push(`${weeks}w`)
  if (days > 0) formattedUptime.push(`${days}d`)
  if (hrs > 0) formattedUptime.push(`${hrs}h`)
  if (mins > 0) formattedUptime.push(`${mins}m`)
  if (secs > 0) formattedUptime.push(`${secs}s`)

  return formattedUptime.join(' ')
}

export const SystemWidget: FC = observer(() => {
  const { t } = useI18n()
  const { systemStatistics } = useSystem()

  return (
    <div className="grid sm:grid-cols-1 grid-cols-1 gap-4 sm:gap-6 w-full lg:grid-cols-1 xl:grid-cols-4">
      {/* CPU */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('system.statistics.cpuUsage')}
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.cpu !== undefined ? (
                <h3 className="text-lg sm:text-2xl font-medium">
                  {systemStatistics.cpu.toFixed(2)}%
                </h3>
              ) : (
                <LoadingSpinner className="size-6" />
              )}
            </div>
            <Progress value={systemStatistics?.cpu} className="mt-6" />
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
                <h3 className="text-lg sm:text-2xl font-medium">
                  {systemStatistics.memory.toFixed(2)}%
                </h3>
              ) : (
                <LoadingSpinner className="size-6" />
              )}
            </div>
            <Progress value={systemStatistics?.memory} className="mt-6" />
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
                <h3 className="text-lg sm:text-2xl font-medium">
                  {systemStatistics.disk.toFixed(2)}%
                </h3>
              ) : (
                <LoadingSpinner className="size-6" />
              )}
            </div>
            <Progress value={systemStatistics?.disk} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      {/* Uptime */}
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
                <LoadingSpinner className="size-6" />
              )}
            </div>
            {/* No progress bar for uptime needed, you can remove this */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
