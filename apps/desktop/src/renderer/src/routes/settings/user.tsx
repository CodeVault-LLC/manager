import { UserEditFields } from '@renderer/components/UserEditFields'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@manager/ui'
import { NoUserCard } from '../../core/components/user/no-user-card'

const RouteComponent = () => {
  const { t } = useI18n()
  const { updateUser, isUserLoggedIn } = useUserStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.navigation.user')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.profile.description')}
        </p>
      </div>

      <Separator />

      {!isUserLoggedIn ? (
        <NoUserCard />
      ) : (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <UserEditFields
            onSubmit={async (data: any) => {
              updateUser({ ...data })
            }}
            avatar
            password
          />
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/settings/user')({
  component: RouteComponent
})
