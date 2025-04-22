import { useUser } from '@renderer/hooks'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { PasswordInput } from '@renderer/core/components/input/PasswordInput'
import { Button } from './ui/button'
import { useForm } from '@tanstack/react-form'
import { useI18n } from '@renderer/hooks/use-i18n'

type UserEditFieldsProps = {
  onSubmit?: <T>(values: T) => Promise<void>
  buttonLabel?: string
  avatar?: boolean
  password?: boolean
}

export const UserEditFields: FC<UserEditFieldsProps> = observer(props => {
  const { t } = useI18n()
  const { isUserLoggedIn, currentUser } = useUser()

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      first_name: currentUser?.first_name,
      last_name: currentUser?.last_name,
      username: currentUser?.username,
      email: currentUser?.email,
      password: '' as string | undefined,
      avatar: null as File | null,
    } as const,
    onSubmit: async ({ value }) => {
      if (props.onSubmit) {
        await props.onSubmit(value)
      } else {
        console.log('values', value)
      }
    }
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={e => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit()
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
                onChange={e => handleChange(() => e.target.value)}
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
                onChange={e => handleChange(e.target.value)}
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
              onChange={e => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        )}
      />

      <Field
        name="email"
        children={({ state, handleChange, handleBlur }) => (
          <div className="grid gap-2">
            <Label htmlFor="email">{t('forms.email.label')}</Label>
            <Input
              defaultValue={state.value}
              type="email"
              placeholder={t('forms.email.placeholder')}
              name="email"
              autoComplete="email"
              required
              onChange={e => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
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
                onChange={e => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          )}
        />
      )}

      {props.avatar && (
        <Field name='avatar' children={({ handleChange }) => (
          <div className="grid gap-2">
            <Label htmlFor="avatar">{t('forms.avatar.label')}</Label>
            <Input
              type="file"
              required
              accept="image/*"
              name="avatar"
              onChange={e => handleChange(e.target.files?.[0] || null)}
            />
          </div>
        )} />
      )}

      <Button type="submit" className="w-full">
        {props.buttonLabel || isUserLoggedIn
          ? t('common.save')
          : t('user.register')}
      </Button>
    </form>
  )
})
