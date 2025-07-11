import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button
} from '@manager/ui'

export const SessionModal = () => {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const { sessions, deleteAllSessions } = useUserStore()

  if (!sessions) return null
  if (sessions.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="ml-auto"
          size="sm"
          disabled={sessions.length === 1}
        >
          {t('user.sessions.revokeAllSessions')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('user.sessions.revokeAllSessions')}</DialogTitle>
          <DialogDescription>
            {t('user.sessions.revokeAllSessionsWarning')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteAllSessions()
              setOpen(false)
            }}
            disabled={sessions.length === 1}
          >
            {t('user.sessions.revokeAll')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
