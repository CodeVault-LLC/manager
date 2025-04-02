import { Card, CardContent } from '@renderer/components/ui/card'
import { Progress } from '@renderer/components/ui/progress'
import { FC } from 'react'

export const SystemWidget: FC = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              CPU Load
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              <h3 className="text-xl sm:text-2xl font-medium">72,540%</h3>
            </div>
            <Progress value={72} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Sessions
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              <h3 className="text-xl sm:text-2xl font-medium">29.4%</h3>
            </div>
            <Progress value={72} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Avg. Click Rate
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              <h3 className="text-xl sm:text-2xl font-medium">56.8%</h3>
            </div>
            <Progress value={72} className="mt-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Pageviews
            </p>
            <div className="mt-1 flex items-center gap-x-2">
              <h3 className="text-xl sm:text-2xl font-medium">92,913</h3>
            </div>
            <Progress value={72} className="mt-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
