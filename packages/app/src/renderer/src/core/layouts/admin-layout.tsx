import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
import { InstanceHeader } from '../components/auth-header/auth-header'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from '../components/admin-sidebar'
import { Toaster } from '@renderer/components/ui/sonner'
import { useSystem } from '@renderer/hooks'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useDashboard } from '@renderer/hooks/use-dashboard'

type TAdminLayout = {
  children: ReactNode
}

export const AdminLayout: FC<TAdminLayout> = observer((props) => {
  const { children } = props
  const { changeLanguage } = useI18n()
  const {
    fetchInitial: getInitialData,
    system,
    doBrowserRefresh,
    subscribeToSystemStatistics,
    unsubscribeFromSystemStatistics
  } = useSystem()

  const { fetchNews } = useDashboard()

  useEffect(() => {
    getInitialData()
    doBrowserRefresh()
    subscribeToSystemStatistics()
    fetchNews()

    const initialLanguage = system.language
    if (initialLanguage) {
      changeLanguage(initialLanguage)
    }

    return () => {
      unsubscribeFromSystemStatistics()
    }
  }, [])

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          <InstanceHeader />
          <Toaster closeButton richColors />

          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden w-full max-w-full">
            <div className="flex flex-1 flex-col overflow-auto w-full max-w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
      {/*<NewUserPopup />*/}
    </div>
  )
})
