import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AuthenticationWrapper } from '../core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'

export const Route = createFileRoute('/notes')({
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
