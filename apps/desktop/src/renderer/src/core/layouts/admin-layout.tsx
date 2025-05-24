import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@shared/helpers'
import { CopyrightIcon } from 'lucide-react'
import { FC, ReactNode, useEffect } from 'react'

import { Toaster, SidebarInset, SidebarProvider } from '@manager/ui'

import { AppSidebar } from '../components/admin-sidebar'
import { InstanceHeader } from '../components/auth-header/auth-header'
import { AuthenticationWrapper } from '../lib/wrappers/authentication-wrapper'
import { useApplicationStore } from '../store/application.store'
import { useDashboardStore } from '../store/dashboard.store'
import { useSystemStore } from '../store/system.store'

type TAdminLayout = {
  children: ReactNode
}

export const AdminLayout: FC<TAdminLayout> = (props) => {
  const { children } = props
  const { changeLanguage } = useI18n()
  const {
    doBrowserRefresh,
    subscribeToSystemStatistics,
    unsubscribeFromSystemStatistics,
    subscribeToSystemInactivity,
    unsubscribeFromSystemInactivity,
    systemInactivity
  } = useSystemStore()

  const { fetchInitialSettings, language } = useApplicationStore()

  const { fetchNews } = useDashboardStore()

  useEffect(() => {
    fetchInitialSettings()
    doBrowserRefresh()
    subscribeToSystemStatistics()
    subscribeToSystemInactivity()
    fetchNews()

    if (language) {
      changeLanguage(language)
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
          {systemInactivity && (
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

          {!systemInactivity && (
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
}
