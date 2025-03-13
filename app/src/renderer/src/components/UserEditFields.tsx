import { useUser } from '@renderer/hooks'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { PasswordInput } from '@renderer/core/components/input/PasswordInput'
import { Button } from './ui/button'

type UserEditFieldsProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  buttonLabel?: string
  avatar?: boolean
}

export const UserEditFields: FC<UserEditFieldsProps> = observer((props) => {
  const { isUserLoggedIn, currentUser } = useUser()

  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-col w-full gap-4">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            name="firstName"
            autoComplete="given-name"
            placeholder="John"
            required
            value={currentUser?.first_name}
          />
        </div>

        <div className="flex flex-col w-full gap-4">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            required
            value={currentUser?.last_name}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="johndoe"
          name="username"
          autoComplete="username"
          required
          value={currentUser?.username}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          name="email"
          autoComplete="email"
          required
          value={currentUser?.email}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" placeholder="********" required name="password" />
      </div>

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
