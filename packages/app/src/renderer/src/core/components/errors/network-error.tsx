import { useEffect, useState } from 'react'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from '../admin-sidebar'
import { WifiOff, ServerOff } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { useApplicationStore } from '@renderer/core/store/application.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useUserStore } from '@renderer/core/store/user.store'
import { useErrorStore } from '@renderer/core/store/error.store'

export const NetworkError = () => {
  const { t } = useI18n()

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { fetchInitialSettings } = useApplicationStore()

  const { fetchCurrentUser } = useUserStore()
  const { clearErrors } = useErrorStore()

  const checkConnection = () => {
    setIsOnline(navigator.onLine)

    if (navigator.onLine) {
      clearErrors()
      fetchCurrentUser()
    }
  }

  useEffect(() => {
    fetchInitialSettings()

    const interval = setInterval(() => {
      checkConnection()
    }, 10000)

    return () => {
      clearInterval(interval)
    }
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
    <ServerOff className="text-red-500 w-10 h-10" />
  ) : (
    <WifiOff className="text-red-500 w-10 h-10" />
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
          {icon}
          <div className="text-3xl font-semibold text-gray-800">
            {t('error.networkError')}
          </div>
          <div className="text-sm text-gray-600 max-w-md">
            {t('error.networkErrorDescription')}
          </div>
          <Button onClick={checkConnection}>{t('common.tryAgain')}</Button>
          <div className="text-xs text-gray-400 max-w-xs">
            {t('error.networkErrorTip')}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
