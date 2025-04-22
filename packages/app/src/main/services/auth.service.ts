import { ipcMain } from 'electron'
import { api } from './api.service'
import { ConfStorage } from '../store'
import { IRegistrationData } from '@shared/types'
import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'

const loadAuthServices = () => {
  ipcMain.handle(
    'auth:login',
    async (_, email: string, password: string): Promise<TCommunicationResponse<boolean>> => {
      try {
        const response = await api.post<{ token: string }>('/users/login/', { email, password })
        const token = response.data.token
        if (token) await ConfStorage.setSecureData('userToken', token)

        return { data: true }
      } catch (error: any) {
        if (error.code === EErrorCodes.ACCOUNT_NOT_FOUND) {
          return {
            error: {
              code: EErrorCodes.ACCOUNT_NOT_FOUND,
              message: 'error.accountNotFound'
            }
          }
        }

        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )

  ipcMain.handle(
    'auth:register',
    async (_, data: IRegistrationData): Promise<TCommunicationResponse<boolean>> => {
      try {
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

        const response = await api.post<{ token: string }>('/users/register/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const token = response.data.token
        if (token) await ConfStorage.setSecureData('userToken', token)

        return { data: true }
      } catch (error: any) {
        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )

  ipcMain.handle('auth:signOut', async (): Promise<TCommunicationResponse<boolean>> => {
    try {
      await api.post('/users/signout/')

      await ConfStorage.deleteSecureData('userToken')
      return { data: true }
    } catch (error: any) {
      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      }
    }
  })
}

export { loadAuthServices }
