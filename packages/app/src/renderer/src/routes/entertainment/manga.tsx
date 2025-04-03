import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/entertainment/manga')({
  component: RouteComponent
})

function RouteComponent() {
  return <Outlet />
}
