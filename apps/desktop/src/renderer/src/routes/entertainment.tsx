import { EPageTypes } from '@manager/common/src'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
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
