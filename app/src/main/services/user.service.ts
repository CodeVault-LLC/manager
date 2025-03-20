import { ISession, IUser } from '@shared/types/users'
import { ipcMain } from 'electron'
import { api } from './api.service'
import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'

const loadUserServices = () => {
  ipcMain.handle('user:adminDetails', async (): Promise<TCommunicationResponse<IUser>> => {
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
          message: 'You do not have permission to access this resource'
        }
      }
    }
  })

  ipcMain.handle('user:getAllSessions', async (): Promise<TCommunicationResponse<ISession[]>> => {
    try {
      const response = await api.get<ISession[]>('/users/sessions/all/')

      return { data: response.data }
    } catch (error: any) {
      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'You do not have permission to access this resource'
        }
      }
    }
  })

  ipcMain.handle('user:deleteAllSessions', async (): Promise<TCommunicationResponse<boolean>> => {
    try {
      await api.delete<void>('/users/sessions/all/')

      return { data: true }
    } catch (error: any) {
      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'You do not have permission to access this resource'
        }
      }
    }
  })

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
            message: 'You do not have permission to access this resource'
          }
        }
      }
    }
  )
}

export { loadUserServices }
