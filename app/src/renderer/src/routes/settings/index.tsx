import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { UserEditFields } from '@renderer/components/UserEditFields'
import { SessionList } from '@renderer/core/components/session'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserEditFields
              onSubmit={() => {
                console.log('Submitting user edit fields')
              }}
            />
          </CardContent>
        </Card>

        <SessionList />
      </div>
    </AuthenticationWrapper>
  )
}
