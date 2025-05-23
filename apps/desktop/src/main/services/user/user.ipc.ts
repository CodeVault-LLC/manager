import { EErrorCodes } from '@shared/helpers'
import { ISession, IUser } from '@shared/types'
import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain } from 'electron'

import { api } from '../api.service'

/**
 * Register all IPC handlers related to user management
 * @description This function registers the IPC handlers for user-related actions.
 * It uses the `ipcMain` module from Electron to handle requests from the renderer process.
 * @returns {void}
 */
export const registerUserIPC = () => {
  ipcMain.handle(
    'user:adminDetails',
    async (): Promise<TCommunicationResponse<IUser>> => {
      try {
        const response = await api.get<IUser>('/users/me/')

        return { data: response.data }
      } catch (error: any) {
        if (error.error) {
          return error
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
    'user:update',
    async (_, user: IUser): Promise<TCommunicationResponse<IUser>> => {
      try {
        const response = await api.patch<IUser>('/users/', user)

        return { data: response.data }
      } catch (error: any) {
        if (error.error) {
          return error
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
    'user:getAllSessions',
    async (): Promise<TCommunicationResponse<ISession[]>> => {
      try {
        const response = await api.get<ISession[]>('/users/sessions/all/')

        return { data: response.data }
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
    'user:deleteAllSessions',
    async (): Promise<TCommunicationResponse<boolean>> => {
      try {
        await api.delete<void>('/users/sessions/all/')

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
    'user:deleteSession',
    async (_, sessionId: string): Promise<TCommunicationResponse<boolean>> => {
      try {
        await api.delete<void>(`/users/sessions/${sessionId}/`)

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
    'user:forgotPassword',
    async (_, email: string): Promise<TCommunicationResponse<boolean>> => {
      try {
        await api.post<void>('/users/forgot-password/', { email })

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
    'user:verifyEmail',
    async (): Promise<TCommunicationResponse<boolean>> => {
      try {
        await api.post<void>('/users/verify-email')

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
    'user:verifyEmailToken',
    async (_, token: string): Promise<TCommunicationResponse<boolean>> => {
      try {
        await api.post<void>('/users/confirm-verify-email/' + token)

        return { data: true }
      } catch (error: any) {
        console.error('Error verifying email token:', error)

        if (error.error.code === EErrorCodes.BAD_REQUEST) {
          return {
            error: {
              code: EErrorCodes.BAD_REQUEST,
              message: 'error.invalidToken'
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
}
