import { FC, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
//import { NewUserPopup } from '@/components/new-user-popup'
import { useUser } from '@renderer/hooks'
import { useRouter } from '@tanstack/react-router'
import { InstanceHeader } from '../components/auth-header/auth-header'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from '../components/admin-sidebar'
import { Toaster } from '@renderer/components/ui/sonner'

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
      router.navigate({ to: '/login' })
    }
  }, [router, isUserLoggedIn])

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <InstanceHeader />
          <Toaster />

          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      {/*<NewUserPopup />*/}
    </div>
  )
})
