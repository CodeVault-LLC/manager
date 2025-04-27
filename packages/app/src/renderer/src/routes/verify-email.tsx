import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader
} from '@renderer/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@renderer/components/ui/input-otp'
import { Label } from '@renderer/components/ui/label'
import { AuthenticationWrapper } from '@renderer/core/lib/wrappers/authentication-wrapper'
import { useUser } from '@renderer/hooks'
import { EPageTypes } from '@shared/helpers'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/verify-email')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { currentUser, isLoading, verifyEmail, verifyEmailToken } = useUser()
  const [verifyOpen, setVerifyOpen] = useState(!currentUser?.verified_email)

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      verification_code: ''
    },
    onSubmit: async ({ value }) => {
      if (value.verification_code) {
        await verifyEmailToken(value.verification_code)
      }
    }
  })

  useEffect(() => {
    if (currentUser?.verified_email) {
      navigate({ to: '/settings/general' })
    }
  }, [currentUser])

  const handleVerifyEmail = async () => {
    await verifyEmail()

    setVerifyOpen(false)
  }

  return (
    <AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
      <div className="mx-auto max-w-md space-y-6 py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Verify your email</h1>
          <p className="text-gray-500 dark:text-gray-400">
            We've sent a verification code to your email address. Enter the code
            below to confirm your identity.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleSubmit()
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
                <Label htmlFor="verification-code">Verification Code</Label>
                <InputOTP
                  maxLength={6}
                  className="w-full"
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
            Verify Email
          </Button>
        </form>
      </div>

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
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              handleVerifyEmail()
            }}
          >
            Resend Verification Code
          </Button>
        </DialogContent>
      </Dialog>
    </AuthenticationWrapper>
  )
}
