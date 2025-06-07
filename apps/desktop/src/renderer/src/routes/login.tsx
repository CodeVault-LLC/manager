import { Google } from '@renderer/components/brands/google'
import { PasswordInput } from '@renderer/core/components/input/PasswordInput'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@manager/common/src'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Button, Separator, Label, Input, Checkbox } from '@manager/ui'

const LoginPage = () => {
  const { t } = useI18n()

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    onSubmit: async ({ value }) => {
      await login(value.email, value.password)
    }
  })

  const { login, currentUser } = useUserStore()

  useEffect(() => {
    if (currentUser?.id) {
      window.location.href = '/'
    }
  }, [currentUser])

  return (
    <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 rounded-lg w-full max-w-2xl mx-auto">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void handleSubmit()
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-xl font-bold">Log in to Manager</h1>
                <div className="text-center text-sm">
                  {t('user.noAccount')}{' '}
                  <Link to="/register" className="underline underline-offset-4">
                    {t('user.register')}
                  </Link>
                </div>
              </div>

              <div className="my-6 flex flex-col items-center gap-4">
                <Button variant="outline" className="w-full" disabled>
                  <Google className="size-6" />
                  Log in with Google
                </Button>
              </div>

              <Separator className="h-px bg-border mb-6" />

              <div className="flex flex-col gap-6">
                <Field
                  name="email"
                  children={({ state, handleChange, handleBlur }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t('forms.email.label')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('forms.email.placeholder')}
                        required
                        autoComplete="email"
                        onChange={(e) => handleChange(() => e.target.value)}
                        onBlur={handleBlur}
                        defaultValue={state.value}
                      />
                    </div>
                  )}
                />

                <Field
                  name="password"
                  children={({ state, handleChange, handleBlur }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="password">
                        {t('forms.password.label')}
                      </Label>
                      <PasswordInput
                        id="password"
                        placeholder={t('forms.password.placeholder')}
                        required
                        onChange={(e) => handleChange(() => e.target.value)}
                        onBlur={handleBlur}
                        defaultValue={state.value}
                      />
                    </div>
                  )}
                />

                <div className="flex items-center justify-between">
                  <Label htmlFor="remember" className="flex items-center gap-2">
                    <Checkbox id="remember" className="cursor-pointer" />
                    {t('forms.rememberMe')}
                  </Label>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {t('common.forgotPassword')}
                  </Link>
                </div>

                <Button type="submit" className="w-full">
                  {t('user.login')}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
            By clicking continue, you agree to our{' '}
            <Link to="/policies/terms">Terms of Service</Link> and{' '}
            <Link to="/policies/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </AuthenticationWrapper>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage
})
