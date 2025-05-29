import { UserEditFields } from '@renderer/components/UserEditFields'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@manager/common/src'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'

const RegisterPage = () => {
  const { t } = useI18n()
  const { register, currentUser } = useUserStore()

  useEffect(() => {
    if (currentUser?.id) {
      window.location.href = '/'
    }
  }, [currentUser])

  return (
    <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
      <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-center">{t('user.register')}</h1>

        <div className="text-center text-sm">
          {t('user.alreadyAccount')}{' '}
          <Link to="/login" className="underline underline-offset-4">
            {t('user.login')}
          </Link>
        </div>
        <UserEditFields
          avatar={true}
          onSubmit={async (data: any) => {
            register({ ...data })
          }}
          password={true}
        />
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
          By clicking continue, you agree to our{' '}
          <Link to="/policies/terms">Terms of Service</Link> and{' '}
          <Link to="/policies/privacy">Privacy Policy</Link>
        </div>
      </div>
    </AuthenticationWrapper>
  )
}

export const Route = createFileRoute('/register')({
  component: RegisterPage
})
