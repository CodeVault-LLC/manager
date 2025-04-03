import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/entertainment')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="w-full p-4">
        <Outlet />
      </div>
    </AuthenticationWrapper>
  )
}
