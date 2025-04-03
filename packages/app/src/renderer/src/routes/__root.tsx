import { Outlet, createRootRoute } from '@tanstack/react-router'
import { AdminLayout } from '@renderer/core/layouts/admin-layout'

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
