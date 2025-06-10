import { ipcMain } from 'electron'
import { api } from '../api.service'
import { authServices } from './auth.service'
import { ConfStorage } from '@main/store'
import {
  EErrorCodes,
  IRegistrationData,
  TCommunicationResponse
} from '@manager/common/src'

/**
 * Register all IPC handlers related to authentication
 * @description This function registers the IPC handlers for login, registration, and sign-out actions.
 * It uses the `ipcMain` module from Electron to handle requests from the renderer process.
 * @returns {void}
 */
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
      } catch (error) {
        log.error('Error during user registration:', error)
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
      } catch (error) {
        log.error('Error during user sign-out:', error)
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
