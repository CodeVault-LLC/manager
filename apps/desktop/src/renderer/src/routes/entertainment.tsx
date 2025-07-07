import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/entertainment')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="w-full p-4">
      <Outlet />
    </div>
  )
}
