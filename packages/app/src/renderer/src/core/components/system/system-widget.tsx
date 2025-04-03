import { Card, CardContent } from '@renderer/components/ui/card'
import { Progress } from '@renderer/components/ui/progress'
import { FC } from 'react'
import { LoadingSpinner } from '../loader/loading-spinner'
import { observer } from 'mobx-react'
import { useSystem } from '@renderer/hooks'

export const SystemWidget: FC = observer(() => {
  const { systemStatistics } = useSystem()

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              CPU Load
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.cpu ? (
                <h3 className="textlg sm:text-2xl font-medium">
                  {systemStatistics?.cpu}%
                </h3>
              ) : (
                <LoadingSpinner className="size-6" />
              )}
            </div>
            <Progress value={systemStatistics?.cpu} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Memory Usage
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.memory ? (
                <h3 className="textlg sm:text-2xl font-medium">
                  {systemStatistics?.memory}%
                </h3>
              ) : (
                <LoadingSpinner className="size-6" />
              )}
            </div>
            <Progress value={systemStatistics?.memory} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Disk Usage
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.disk[0]?.load ? (
                <h3 className="text-xl sm:text-2xl font-medium">
                  {systemStatistics?.disk[0]?.load}%
                </h3>
              ) : (
                <LoadingSpinner className="size-6" />
              )}
            </div>
            <Progress
              value={systemStatistics?.disk[0]?.load}
              className="mt-6"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Uptime
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              {systemStatistics?.uptime ? (
                <h3 className="text-lg sm:text-2xl font-medium">
                  {Math.floor(systemStatistics?.uptime / 60)}m
                </h3>
              ) : (
                <LoadingSpinner className="size-6" />
              )}
            </div>
            <Progress
              value={systemStatistics?.uptime}
              max={100}
              className="mt-6"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
