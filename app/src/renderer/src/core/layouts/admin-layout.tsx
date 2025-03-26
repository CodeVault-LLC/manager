import { FC, ReactNode } from 'react'
import { observer } from 'mobx-react'
import { InstanceHeader } from '../components/auth-header/auth-header'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from '../components/admin-sidebar'
import { Toaster } from '@renderer/components/ui/sonner'

type TAdminLayout = {
  children: ReactNode
}

export const AdminLayout: FC<TAdminLayout> = observer((props) => {
  const { children } = props

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <InstanceHeader />
          <Toaster />

          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
            <div className="flex flex-1 flex-col overflow-auto">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
      {/*<NewUserPopup />*/}
    </div>
  )
})
