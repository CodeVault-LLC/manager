import { useApplicationStore } from '@renderer/core/store/application.store'
import { useErrorStore } from '@renderer/core/store/error.store'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { WifiOff, ServerOff, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button, SidebarInset, SidebarProvider, Card } from '@manager/ui'
import { AppSidebar } from '../admin-sidebar'

export const NetworkError = () => {
  const { t } = useI18n()

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isChecking, setIsChecking] = useState(false)
  const { fetchInitialSettings } = useApplicationStore()

  const { fetchCurrentUser } = useUserStore()
  const { clearErrors } = useErrorStore()

  const checkConnection = () => {
    setIsChecking(true)
    setTimeout(() => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        clearErrors()
        fetchCurrentUser()
      }
      setIsChecking(false)
    }, 800) // Small artificial delay for UX feedback
  }

  useEffect(() => {
    fetchInitialSettings()
    const interval = setInterval(() => {
      checkConnection()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  const icon = isOnline ? (
    <ServerOff className="text-destructive h-10 w-10" />
  ) : (
    <WifiOff className="text-destructive h-10 w-10" />
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden bg-muted/20">
        <div className="flex h-full min-h-[80vh] flex-col items-center justify-center p-4">
          <Card className="relative w-full max-w-md overflow-hidden border-destructive/20 shadow-lg text-center p-8 sm:p-10">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-destructive/5 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-destructive/5 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
                {icon}
              </div>

              <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                {t('error.networkError')}
              </h1>

              <p className="mb-8 text-sm text-muted-foreground">
                {t('error.networkErrorDescription')}
              </p>

              <Button
                onClick={checkConnection}
                disabled={isChecking}
                className="w-full sm:w-auto min-w-[160px]"
                size="lg"
              >
                {isChecking ? (
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t('common.tryAgain')}
              </Button>

              <p className="mt-6 text-xs text-muted-foreground/70">
                {t('error.networkErrorTip')}
              </p>
            </div>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
