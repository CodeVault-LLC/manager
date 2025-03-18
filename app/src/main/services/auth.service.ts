import { ipcMain } from 'electron'
import { api } from './api.service'
import { ConfStorage } from '../store'
import { IRegistrationData } from '@shared/types'
import { ICommunicationResponse } from '@shared/types/communication'

const loadAuthServices = () => {
  ipcMain.handle(
    'auth:login',
    async (_, email: string, password: string): Promise<ICommunicationResponse> => {
      try {
        const response = await api.post<{ token: string }>('/users/login/', { email, password })
        const token = response.data.token
        if (token) await ConfStorage.setSecureData('userToken', token)

        return { success: true }
      } catch (error: any) {
        if (error.response?.status === 403) return { error: 'Forbidden' }
        if (error.response?.status === 404) return { error: 'User was not found' }

        return { error: 'Login failed: ' + (error.response?.data?.error || error.message) }
      }
    }
  )

  ipcMain.handle(
    'auth:register',
    async (_, data: IRegistrationData): Promise<ICommunicationResponse> => {
      try {
        const { avatar, ...rest } = data

        const formData = new FormData()

        if (avatar) {
          const buffer = Buffer.from(avatar.buffer as number[])

          const blob = new Blob([buffer], { type: avatar.type })

          formData.append('avatar', blob, avatar.name)
        }

        Object.entries(rest).forEach(([key, value]) => {
          if (typeof value === 'string' || value instanceof Blob) {
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

        return { success: true }
      } catch (error: any) {
        console.error('Failed to register', error)

        return { error: 'Registration failed: ' + (error.response?.data?.error || error.message) }
      }
    }
  )

  ipcMain.handle('auth:signOut', async () => {
    try {
      const response = await api.post('/users/signout/')
      console.log(response)

      if (response.status === 204) {
        await ConfStorage.deleteSecureData('userToken')

        return { success: true }
      }

      return { error: 'Failed to sign out' }
    } catch (error: any) {
      console.error('Failed to sign out', error)

      return { error: 'Failed to sign out: ' + (error.response?.data?.error || error.message) }
    }
  })
}

export { loadAuthServices }
