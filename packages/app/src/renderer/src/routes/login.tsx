import { Google } from '@renderer/components/brands/google'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Separator } from '@renderer/components/ui/separator'
import { PasswordInput } from '@renderer/core/components/input/PasswordInput'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useUser } from '@renderer/hooks'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@shared/helpers'
import { createFileRoute, Link } from '@tanstack/react-router'

import { observer } from 'mobx-react'
import { useState, useEffect } from 'react'

const LoginPage = observer(() => {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login, currentUser } = useUser()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await login(email, password)
  }

  useEffect(() => {
    if (currentUser?.id) {
      window.location.href = '/'
    }
  }, [currentUser])

  return (
    <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 rounded-lg w-full max-w-2xl mx-auto">
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
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
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('forms.email.label')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('forms.email.placeholder')}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t('forms.password.label')}</Label>
                  <PasswordInput
                    id="password"
                    placeholder={t('forms.password.placeholder')}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
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
})

export const Route = createFileRoute('/login')({
  component: LoginPage
})
