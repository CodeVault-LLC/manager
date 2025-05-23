import { AdminLayout } from '@renderer/core/layouts/admin-layout'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
