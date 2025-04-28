import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain } from 'electron'
import { api } from '../api.service'
import { ConfStorage } from '@main/store'
import { EErrorCodes } from '@shared/helpers'
import { IRegistrationData } from '@shared/types'
import { authServices } from './auth.service'

export const registerAuthIPC = () => {
  ipcMain.handle(
    'auth:login',
    async (
      _,
      email: string,
      password: string
    ): Promise<TCommunicationResponse<boolean>> => {
      try {
        const response = await api.post<{ token: string }>('/users/login/', {
          email,
          password
        })
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
    async (
      _,
      data: IRegistrationData
    ): Promise<TCommunicationResponse<boolean>> => {
      try {
        const formData = authServices.prepareAuthRegistrationFormData(data)

        const response = await api.post<{ token: string }>(
          '/users/register/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )

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

  ipcMain.handle(
    'auth:signOut',
    async (): Promise<TCommunicationResponse<boolean>> => {
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
    }
  )
}
