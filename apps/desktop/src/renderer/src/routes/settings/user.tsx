import { UserEditFields } from '@renderer/components/UserEditFields'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { createFileRoute } from '@tanstack/react-router'
import { Separator, Card } from '@manager/ui'
import { NoUserCard } from '../../core/components/user/no-user-card'

const RouteComponent = () => {
  const { t } = useI18n()
  const { updateUser, isUserLoggedIn } = useUserStore()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Standardized Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('settings.navigation.user')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('settings.profile.description')}
        </p>
      </div>

      <Separator />

      {!isUserLoggedIn ? (
        <NoUserCard />
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Profile Details
          </h2>
          <Card className="p-6 shadow-sm">
            <UserEditFields
              onSubmit={async (data: any) => {
                updateUser({ ...data })
              }}
              avatar
              password
            />
          </Card>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/settings/user')({
  component: RouteComponent
})
