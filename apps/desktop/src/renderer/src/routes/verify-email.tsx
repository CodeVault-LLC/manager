import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { EPageTypes } from '@shared/helpers'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import {
  Button,
  Label,
  Alert,
  AlertDescription,
  AlertTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@manager/ui'

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { currentUser, isLoading, verifyEmail, verifyEmailToken } =
    useUserStore()
  const [verifyOpen, setVerifyOpen] = useState(!currentUser?.verified_email)
  const [successful, setSuccessful] = useState(false)

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      verification_code: ''
    },
    onSubmit: async ({ value }) => {
      if (value.verification_code) {
        const response = await verifyEmailToken(value.verification_code)
        setSuccessful(response)
      }
    }
  })

  useEffect(() => {
    if (currentUser?.verified_email || successful) {
      const timeout = setTimeout(() => {
        void navigate({ to: '/' })
      }, 5000)

      return () => {
        clearTimeout(timeout)
      }
    }

    return () => {}
  }, [currentUser, successful])

  const handleVerifyEmail = async () => {
    await verifyEmail()

    setVerifyOpen(false)
  }

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      {successful ? (
        <div>
          <div className="mx-auto max-w-xl space-y-6 py-12 px-4 sm:px-6 lg:px-8">
            <Alert variant={'default'}>
              <AlertTitle className="font-bold text-base">
                {t('user.verifyEmail.emailVerifiedSuccessTitle')}
              </AlertTitle>
              <AlertDescription>
                {t('user.verifyEmail.emailVerifiedSuccess')}
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-center">
              <p>
                Redirecting you to the dashboard in <strong>5 seconds</strong>.
                If you are not redirected, click{' '}
                <strong>
                  <Link
                    to="/"
                    className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                  >
                    here
                  </Link>
                </strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-xl space-y-6 py-12 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">
              {t('user.verifyEmail.verifyEmail')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t('user.verifyEmail.verificationSent')}
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void handleSubmit()
            }}
          >
            <Field
              name="verification_code"
              validators={{
                onSubmit: (value) => {
                  if (value.value.length < 6) {
                    return 'Verification code must be 6 digits'
                  }

                  if (isLoading) {
                    return 'Please wait...'
                  }

                  return undefined
                }
              }}
              children={({ state, handleChange, handleBlur }) => (
                <div className="w-full">
                  <Label htmlFor="verification-code">
                    {t('common.verificationCode')}
                  </Label>
                  <InputOTP
                    maxLength={6}
                    className="w-full flex justify-center"
                    disabled={isLoading}
                    required
                    onChange={(e) => handleChange(() => e)}
                    onBlur={handleBlur}
                    defaultValue={state.value}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {t('user.verifyEmail.verifyEmail')}
            </Button>
          </form>
        </div>
      )}

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold">Send a verification code</h2>
          </DialogHeader>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click the button below to resend the verification code to your email
          </p>

          <Button
            className="w-full"
            variant="outline"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              void handleVerifyEmail()
            }}
          >
            Resend Verification Code
          </Button>
        </DialogContent>
      </Dialog>
    </AuthenticationWrapper>
  )
}
