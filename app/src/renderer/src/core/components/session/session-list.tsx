import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { useUser } from '@renderer/hooks'
import { Clock, Globe } from 'lucide-react'
import { observer } from 'mobx-react'
import { useEffect } from 'react'
import { SessionModal } from './session-modal'
import { prettifyToHumanReadableDate } from '@shared/helpers/date.helper'

export const SessionList = observer(() => {
  const { sessions, fetchAllSessions, signOut, deleteSession } = useUser()

  useEffect(() => {
    fetchAllSessions()
  }, [fetchAllSessions])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Manage your active sessions.</CardDescription>
          </div>

          <SessionModal />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {sessions && sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex flex-row items-center gap-2">
                <Globe className="h-4 w-4" />
                No active sessions found.
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                You can log in from other devices to create new sessions.
              </div>
            </div>
          )}

          {sessions &&
            sessions.map((session) => (
              <div
                className="flex items-center gap-8 p-4 border-b border-gray-200 dark:border-gray-700"
                key={session.id}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row items-center gap-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.systemInfo}
                    </div>

                    {session.isCurrentSession && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs rounded-xl">
                            Current
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>This is your current session.</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-row items-center gap-2">
                    <Globe className="h-3 w-3" />
                    {session.ipAddress}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-row items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {prettifyToHumanReadableDate(new Date(session.lastUsedAt))}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="ml-auto"
                  size="sm"
                  onClick={() => {
                    if (session.isCurrentSession) {
                      signOut()
                    } else {
                      deleteSession(session.id)
                    }
                  }}
                >
                  {session.isCurrentSession ? 'Logout' : 'Revoke'}
                </Button>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
})
