import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
import { InstanceHeader } from '../components/auth-header/auth-header'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from '../components/admin-sidebar'
import { Toaster } from '@renderer/components/ui/sonner'
import { useSystem } from '@renderer/hooks'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useDashboard } from '@renderer/hooks/use-dashboard'
import { AuthenticationWrapper } from '../lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { CopyrightIcon } from 'lucide-react'

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
    unsubscribeFromSystemStatistics,
    subscribeToSystemInactivity,
    unsubscribeFromSystemInactivity,
    inactive
  } = useSystem()

  const { fetchNews } = useDashboard()

  useEffect(() => {
    getInitialData()
    doBrowserRefresh()
    subscribeToSystemStatistics()
    subscribeToSystemInactivity()
    fetchNews()

    const initialLanguage = system.language
    if (initialLanguage) {
      changeLanguage(initialLanguage)
    }

    return () => {
      unsubscribeFromSystemStatistics()
      unsubscribeFromSystemInactivity()
    }
  }, [])

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          {inactive && (
            <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
              <div className="absolute top-4 right-4 bg-background rounded-md p-4 shadow-md max-w-lg w-full flex flex-row gap-4 items-center">
                <div>
                  <h2 className="text-sm leading-tight font-semibold truncate">
                    A fragrant tradition
                  </h2>
                  <p className="text-xs truncate">
                    Plumeria flowers, Hawaii (© Miranda Images)
                  </p>
                </div>

                <div className="flex flex-1 items-center justify-end">
                  <button
                    onClick={() => {
                      window.open(
                        'https://www.microsoft.com/en-us/insider/insider-program',
                        '_blank'
                      )
                    }}
                    className="text-sm text-primary font-semibold"
                  >
                    <CopyrightIcon />
                  </button>
                </div>
              </div>

              <img
                src={`https://bing.com//th?id=OHR.PinkPlumeria_EN-US3595771407_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp`}
                alt="Lock Screen"
                className="w-full h-full object-cover"
              />
            </AuthenticationWrapper>
          )}

          {!inactive && (
            <>
              <InstanceHeader />
              <Toaster closeButton richColors />

              <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden w-full max-w-full">
                <div className="flex flex-1 flex-col overflow-auto w-full max-w-full">
                  {children}
                </div>
              </main>
            </>
          )}
        </SidebarInset>
      </SidebarProvider>
      {/*<NewUserPopup />*/}
    </div>
  )
})
