import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { UserEditFields } from '@renderer/components/UserEditFields'
import { IntegrationList } from '@renderer/core/components/integration'
import { SessionList } from '@renderer/core/components/session'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/')({
  component: RouteComponent
})

function RouteComponent() {
  const { t } = useI18n()

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.profile.title')}</CardTitle>
            <CardDescription>{t('settings.profile.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <UserEditFields
              onSubmit={() => {
                console.log('Submitting user edit fields')
              }}
            />
          </CardContent>
        </Card>

        <IntegrationList />

        <SessionList />
      </div>
    </AuthenticationWrapper>
  )
}
