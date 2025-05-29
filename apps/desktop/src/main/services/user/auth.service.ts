import { IRegistrationData } from '@manager/common/src'

export const authServices = {
  prepareAuthRegistrationFormData: (data: IRegistrationData): FormData => {
    const { avatar, ...rest } = data

    const formData = new FormData()

    if (avatar) {
      const buffer = Buffer.from(avatar.buffer as number[])

      const blob = new Blob([buffer], { type: avatar.type })

      formData.append('avatar', blob, avatar.name)
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === 'string' || (value as any) instanceof Blob) {
        formData.append(key, value)
      } else {
        formData.append(key, JSON.stringify(value))
      }
    })

    return formData
  }
}
