import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'
import { Clock, Globe } from 'lucide-react'
import { useEffect } from 'react'
import { prettifyToHumanReadableDate } from '@shared/helpers/date.helper'
import { useI18n } from '@renderer/hooks/use-i18n'
import { ISession } from '@shared/types'
import { WindowsIcon } from '@renderer/components/brands'
import { Separator } from '@renderer/components/ui/separator'
import { SessionModal } from '@renderer/core/components/session/session-modal'
import { useUserStore } from '@renderer/core/store/user.store'

const RouteComponent = () => {
  const { t } = useI18n()
  const { sessions, fetchAllSessions, signOut, deleteSession } = useUserStore()

  useEffect(() => {
    fetchAllSessions()
  }, [fetchAllSessions])

  const findSessionIcon = (session: ISession) => {
    if (session.systemInfo.includes('Windows')) {
      return <WindowsIcon className="size-4" />
    } else if (session.systemInfo.includes('Linux')) {
      return <WindowsIcon className="size-4" />
    } else if (session.systemInfo.includes('Mac')) {
      return <WindowsIcon className="size-4" />
    }

    return <WindowsIcon className="size-4" />
  }

  return (
    <>
      <h1 className="text-2xl font-bold">
        {t('settings.navigation.security')}
      </h1>

      <Separator className="my-4" />

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{t('settings.sessions.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.sessions.description')}
          </p>
        </div>

        <SessionModal />
      </div>
      <div className="grid gap-4 my-4">
        {sessions && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex flex-row items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('user.sessions.noSessions')}
            </div>
          </div>
        )}

        {sessions &&
          sessions.map((session) => (
            <div
              className="flex items-center gap-8 border-gray-200 dark:border-gray-700 border-t border-b py-2"
              key={session.id}
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                  {findSessionIcon(session)}

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
                      <TooltipContent>
                        {t('settings.sessions.currentTooltip')}
                      </TooltipContent>
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
                {session.isCurrentSession
                  ? t('user.logout')
                  : t('user.sessions.revoke')}
              </Button>
            </div>
          ))}
      </div>
    </>
  )
}

export const Route = createFileRoute('/settings/security')({
  component: RouteComponent
})
