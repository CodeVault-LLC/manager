import { useUser } from '@renderer/hooks'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { PasswordInput } from '@renderer/core/components/input/PasswordInput'
import { Button } from './ui/button'
import { useForm } from '@tanstack/react-form'

type UserEditFieldsProps = {
  onSubmit: (values: Record<string, any>) => void
  buttonLabel?: string
  avatar?: boolean
}

export const UserEditFields: FC<UserEditFieldsProps> = observer((props) => {
  const { isUserLoggedIn, currentUser } = useUser()

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      firstName: currentUser?.first_name,
      lastName: currentUser?.last_name,
      username: currentUser?.username,
      email: currentUser?.email,
      password: ''
    },
    onSubmit: props.onSubmit
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit()
      }}
    >
      <div className="flex flex-row items-center gap-4">
        <Field
          name="firstName"
          children={({ state, handleChange, handleBlur }) => (
            <div className="flex flex-col w-full gap-4">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                defaultValue={state.value}
                placeholder="John"
                required
                autoComplete="given-name"
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
            </div>
          )}
        />

        <Field
          name="lastName"
          children={({ state, handleChange, handleBlur }) => (
            <div className="flex flex-col w-full gap-4">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                defaultValue={state.value}
                placeholder="Doe"
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
            <Label htmlFor="username">Username</Label>
            <Input
              defaultValue={state.value}
              type="text"
              placeholder="johndoe"
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
            <Label htmlFor="email">Email</Label>
            <Input
              defaultValue={state.value}
              type="email"
              placeholder="m@example.com"
              name="email"
              autoComplete="email"
              required
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        )}
      />

      <Field
        name="password"
        children={({ state, handleChange, handleBlur }) => (
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              defaultValue={state.value}
              id="password"
              placeholder="********"
              required
              name="password"
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        )}
      />

      {props.avatar && (
        <div className="grid gap-2">
          <Label htmlFor="avatar">Avatar</Label>
          <Input id="avatar" type="file" required />
        </div>
      )}

      <Button type="submit" className="w-full">
        {props.buttonLabel || isUserLoggedIn ? 'Save' : 'Register'}
      </Button>
    </form>
  )
})
