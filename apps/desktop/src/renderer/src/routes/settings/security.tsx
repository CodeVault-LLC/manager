import { WindowsIcon } from '@renderer/components/brands'
import { SessionModal } from '@renderer/core/components/session/session-modal'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { prettifyToHumanReadableDate } from '@shared/helpers/date.helper'
import { createFileRoute } from '@tanstack/react-router'
import { Clock, Globe, ShieldCheck, Laptop } from 'lucide-react'
import { useEffect } from 'react'

import { Badge, Button, Card, Separator } from '@manager/ui'
import { ISession } from '@manager/common'

const RouteComponent = () => {
  const { t } = useI18n()
  const { sessions, fetchAllSessions, signOut, deleteSession } = useUserStore()

  useEffect(() => {
    fetchAllSessions()
  }, [fetchAllSessions])

  const findSessionIcon = (session: ISession) => {
    // Basic fallback logic updated to ensure visual distinction if brand icons fail
    if (session.systemInfo.includes('Windows'))
      return <WindowsIcon className="h-5 w-5" />
    if (session.systemInfo.includes('Linux'))
      return <Laptop className="h-5 w-5 text-muted-foreground" />
    if (session.systemInfo.includes('Mac'))
      return <Laptop className="h-5 w-5 text-muted-foreground" />
    return <Globe className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Standardized Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('settings.navigation.security')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account security and active sessions.
        </p>
      </div>

      <Separator />

      {/* Sessions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {t('settings.sessions.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('settings.sessions.description')}
            </p>
          </div>
          <SessionModal />
        </div>

        <Card className="overflow-hidden shadow-sm">
          {(!sessions || sessions.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">
                {t('user.sessions.noSessions')}
              </p>
            </div>
          )}

          {sessions &&
            sessions.map((session, index) => (
              <div
                key={session.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 hover:bg-muted/30 transition-colors ${
                  index !== sessions.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-md bg-muted p-2">
                    {findSessionIcon(session)}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {session.systemInfo}
                      </span>
                      {session.isCurrentSession && (
                        <Badge
                          variant="default"
                          className="text-[10px] uppercase tracking-wider px-1.5 py-0"
                        >
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        {session.ipAddress}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {prettifyToHumanReadableDate(
                          new Date(session.lastUsedAt)
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant={session.isCurrentSession ? 'outline' : 'destructive'}
                  size="sm"
                  className="w-full sm:w-auto shrink-0"
                  onClick={() =>
                    session.isCurrentSession
                      ? signOut()
                      : deleteSession(session.id)
                  }
                >
                  {session.isCurrentSession
                    ? t('user.logout')
                    : t('user.sessions.revoke')}
                </Button>
              </div>
            ))}
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/settings/security')({
  component: RouteComponent
})
