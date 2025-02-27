import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
// components
import { LogoSpinner } from '../components/loader/LogoSpinner'
//import { NewUserPopup } from '@/components/new-user-popup'
import { useUser } from '@renderer/hooks'
import { useRouter } from '@tanstack/react-router'
import { InstanceHeader } from '../components/auth-header/auth-header'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from '../components/admin-sidebar'

type TAdminLayout = {
  children: ReactNode
}

export const AdminLayout: FC<TAdminLayout> = observer((props) => {
  const { children } = props
  const router = useRouter()
  // store hooks
  const { isUserLoggedIn } = useUser()

  useEffect(() => {
    if (isUserLoggedIn === false) {
      router.navigate({ to: '/' })
    }
  }, [router, isUserLoggedIn])

  if (isUserLoggedIn !== undefined) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center">
        <LogoSpinner />
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <InstanceHeader />

          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </main>
        </SidebarInset>
      </SidebarProvider>
      {/*<NewUserPopup />*/}
    </div>
  )
})
