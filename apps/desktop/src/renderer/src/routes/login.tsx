import { Google } from '@renderer/components/brands/google'
import { PasswordInput } from '@renderer/core/components/input/PasswordInput'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@manager/common'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'

import {
  Button,
  Separator,
  Label,
  Input,
  Checkbox,
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '@manager/ui'

const LoginPage = () => {
  const { t } = useI18n()
  const { login, currentUser } = useUserStore()

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    onSubmit: async ({ value }) => {
      await login(value.email, value.password)
    }
  })

  useEffect(() => {
    if (currentUser?.id) {
      window.location.href = '/'
    }
  }, [currentUser])

  return (
    <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-xl shadow-xl border-muted/50">
          <CardHeader className="space-y-2 text-center pt-8">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              {/* Optional Logo Placeholder */}
              <div className="h-6 w-6 rounded bg-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('user.noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                {t('user.register')}
              </Link>
            </p>
          </CardHeader>

          <CardContent className="pb-8">
            <Button variant="outline" className="w-full mb-6" disabled>
              <Google className="mr-2 h-5 w-5" />
              Log in with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void handleSubmit()
              }}
            >
              <Field
                name="email"
                children={({ state, handleChange, handleBlur }) => (
                  <div className="space-y-2">
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
                      className="bg-muted/50"
                    />
                  </div>
                )}
              />

              <Field
                name="password"
                children={({ state, handleChange, handleBlur }) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">
                        {t('forms.password.label')}
                      </Label>
                      <Link
                        to="/"
                        className="text-xs font-medium text-primary hover:underline underline-offset-4"
                      >
                        {t('common.forgotPassword')}
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      placeholder={t('forms.password.placeholder')}
                      required
                      onChange={(e) => handleChange(() => e.target.value)}
                      onBlur={handleBlur}
                      defaultValue={state.value}
                      className="bg-muted/50"
                    />
                  </div>
                )}
              />

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="remember" className="rounded-sm" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  {t('forms.rememberMe')}
                </Label>
              </div>

              <Button type="submit" className="w-full" size="lg">
                {t('user.login')}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t bg-muted/20 px-6 py-4">
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              By clicking continue, you agree to our{' '}
              <Link
                to="/policies/terms"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/policies/privacy"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </AuthenticationWrapper>
  )
}

export const Route = createFileRoute('/login')({
  component: LoginPage
})
