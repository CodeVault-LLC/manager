import { PasswordInput } from '@renderer/core/components/input/PasswordInput'
import { useUserStore } from '@renderer/core/store/user.store'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { MailCheckIcon, VerifiedIcon } from 'lucide-react'
import { FC } from 'react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@manager/ui'

type UserEditFieldsProps = {
  onSubmit?: <T>(values: T) => Promise<void>
  buttonLabel?: string
  avatar?: boolean
  password?: boolean
}

export const UserEditFields: FC<UserEditFieldsProps> = (props) => {
  const { t } = useI18n()
  const { isUserLoggedIn, currentUser } = useUserStore()

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      first_name: currentUser?.first_name,
      last_name: currentUser?.last_name,
      username: currentUser?.username,
      email: currentUser?.email,
      password: '' as string | undefined,
      avatar: null as File | null
    } as const,
    onSubmit: async ({ value }) => {
      if (props.onSubmit) {
        await props.onSubmit(value)
      } else {
        // eslint-disable-next-line no-console
        console.log('values', value)
      }
    }
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void handleSubmit()
      }}
    >
      <div className="flex flex-row items-center gap-4">
        <Field
          name="first_name"
          children={({ state, handleChange, handleBlur }) => (
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="firstName">{t('forms.firstName.label')}</Label>
              <Input
                defaultValue={state.value}
                placeholder={t('forms.firstName.placeholder')}
                required
                autoComplete="given-name"
                onChange={(e) => handleChange(() => e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          )}
        />

        <Field
          name="last_name"
          children={({ state, handleChange, handleBlur }) => (
            <div className="flex flex-col w-full gap-2">
              <Label htmlFor="lastName">{t('forms.lastName.label')}</Label>
              <Input
                defaultValue={state.value}
                placeholder={t('forms.lastName.placeholder')}
                required
                autoComplete="family-name"
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          )}
        />
      </div>

      <Field
        name="username"
        children={({ state, handleChange, handleBlur }) => (
          <div className="grid gap-2">
            <Label htmlFor="username">{t('forms.username.label')}</Label>
            <Input
              defaultValue={state.value}
              type="text"
              placeholder={t('forms.username.placeholder')}
              name="username"
              autoComplete="username"
              required
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        )}
      />

      <Field
        name="email"
        children={({ state, handleChange, handleBlur }) => (
          <div className="grid gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Label htmlFor="email">{t('forms.email.label')}</Label>
              {currentUser?.verified_email && (
                <Tooltip>
                  <TooltipTrigger>
                    <VerifiedIcon
                      className="text-green-600 dark:text-green-500"
                      size={16}
                    />
                  </TooltipTrigger>

                  <TooltipContent>
                    {t('user.verifyEmail.emailVerificationTooltip')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Input
              defaultValue={state.value}
              type="email"
              placeholder={t('forms.email.placeholder')}
              name="email"
              autoComplete="email"
              required
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            />

            {!currentUser?.verified_email && (
              <Alert variant={'warning'} className="w-full">
                <MailCheckIcon size={16} />

                <AlertTitle className="font-bold text-base">
                  {t('user.verifyEmail.notVerifiedEmailTitle')}
                </AlertTitle>

                <AlertDescription>
                  <div className="flex flex-row gap-2 items-center justify-between">
                    {t('user.verifyEmail.notVerifiedEmailInfo')}

                    <Link
                      to="/verify-email"
                      className="text-sm text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                    >
                      {t('user.verifyEmail.verifyEmail')}
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      />

      {props.password && (
        <Field
          name="password"
          children={({ state, handleChange, handleBlur }) => (
            <div className="grid gap-2">
              <Label htmlFor="password">{t('forms.password.label')}</Label>
              <PasswordInput
                defaultValue={state.value}
                id="password"
                placeholder={t('forms.password.placeholder')}
                required
                name="password"
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          )}
        />
      )}

      {props.avatar && (
        <Field
          name="avatar"
          children={({ handleChange }) => (
            <div className="grid gap-2">
              <Label htmlFor="avatar">{t('forms.avatar.label')}</Label>
              <Input
                type="file"
                required
                accept="image/*"
                name="avatar"
                onChange={(e) => handleChange(e.target.files?.[0] || null)}
              />
            </div>
          )}
        />
      )}

      <Button type="submit" className="w-full">
        {props.buttonLabel || isUserLoggedIn
          ? t('common.save')
          : t('user.register')}
      </Button>
    </form>
  )
}
