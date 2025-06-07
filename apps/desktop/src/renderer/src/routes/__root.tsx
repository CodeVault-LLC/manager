import { Layout } from '@renderer/core/layouts/layout'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
