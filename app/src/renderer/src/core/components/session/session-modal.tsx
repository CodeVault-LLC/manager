import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { useUser } from '@renderer/hooks'
import { observer } from 'mobx-react'
import { useState } from 'react'

export const SessionModal = observer(() => {
  const [open, setOpen] = useState(false)
  const { sessions, deleteAllSessions } = useUser()

  if (!sessions) return null
  if (sessions.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto" size="sm" disabled={sessions.length === 1}>
          Logout all sessions
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke All Sessions</DialogTitle>
          <DialogDescription>
            This will log you out from all devices except your current one. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteAllSessions()
              setOpen(false)
            }}
            disabled={sessions.length === 1}
          >
            Revoke All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
