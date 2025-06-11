import { useI18n } from '@renderer/hooks/use-i18n'
import { CopyrightIcon } from 'lucide-react'
import { FC, ReactNode, useEffect } from 'react'

import { Toaster, SidebarInset, SidebarProvider } from '@manager/ui'

import { AppSidebar } from '../components/admin-sidebar'
import { InstanceHeader } from '../components/auth-header/auth-header'
import { useApplicationStore } from '../store/application.store'
import { useSystemStore } from '../store/system.store'
import { useUserStore } from '../store/user.store'

type TAdminLayout = {
  children: ReactNode
}

export const Layout: FC<TAdminLayout> = (props) => {
  const { children } = props
  const { changeLanguage } = useI18n()
  const {
    subscribeToSystemInactivity,
    unsubscribeFromSystemInactivity,
    systemInactivity
  } = useSystemStore()

  const { fetchCurrentUser } = useUserStore()

  const {
    fetchInitialSettings,
    language,
    subscribeToUpdateStatus,
    unsubscribeFromUpdateStatus
  } = useApplicationStore()

  useEffect(() => {
    void fetchInitialSettings() // Init application settings
    void fetchCurrentUser()
    //doBrowserRefresh() Not needed here, should be handled in page
    subscribeToSystemInactivity()
    subscribeToUpdateStatus()

    //void fetchNews()

    if (language) {
      changeLanguage(language)
    }

    return () => {
      unsubscribeFromSystemInactivity()
      unsubscribeFromUpdateStatus()
    }
  }, [])

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-x-hidden">
          {systemInactivity && (
            <>
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
            </>
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
