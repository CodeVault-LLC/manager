import { ISession, IUser } from '@shared/types/users'
import { ipcMain } from 'electron'
import { api } from './api.service'
import { EAuthenticationErrorCodes } from '@shared/helpers'
import { ICommunicationResponse } from '@shared/types/communication'

const loadUserServices = () => {
  ipcMain.handle('user:adminDetails', async (): Promise<ICommunicationResponse<IUser>> => {
    try {
      const response = await api.get<IUser>('/users/me/')

      return { data: response.data }
    } catch (error: any) {
      if (error.response?.status === 403) return { error: EAuthenticationErrorCodes.FORBIDDEN }
      if (error.response?.status === 401) return { error: EAuthenticationErrorCodes.UNAUTHORIZED }
      return {
        error: 'Failed to fetch user details: ' + (error.response?.data?.error || error.message)
      }
    }
  })

  ipcMain.handle('user:getAllSessions', async (): Promise<ICommunicationResponse<ISession[]>> => {
    try {
      const response = await api.get<ISession[]>('/users/sessions/all/')

      return { data: response.data }
    } catch (error: any) {
      if (error.response?.status === 403) return { error: EAuthenticationErrorCodes.FORBIDDEN }
      if (error.response?.status === 401) return { error: EAuthenticationErrorCodes.UNAUTHORIZED }
      return {
        error: 'Failed to fetch user details: ' + (error.response?.data?.error || error.message)
      }
    }
  })

  ipcMain.handle('user:deleteAllSessions', async (): Promise<ICommunicationResponse> => {
    try {
      const response = await api.delete<void>('/users/sessions/all/')

      return { data: response.data, success: true }
    } catch (error: any) {
      if (error.response?.status === 403) return { error: EAuthenticationErrorCodes.FORBIDDEN }
      if (error.response?.status === 401) return { error: EAuthenticationErrorCodes.UNAUTHORIZED }
      return {
        error: 'Failed to fetch user details: ' + (error.response?.data?.error || error.message)
      }
    }
  })

  ipcMain.handle(
    'user:deleteSession',
    async (_, sessionId: string): Promise<ICommunicationResponse> => {
      try {
        const response = await api.delete<void>(`/users/sessions/${sessionId}/`)

        return { data: response.data, success: true }
      } catch (error: any) {
        if (error.response?.status === 403) return { error: EAuthenticationErrorCodes.FORBIDDEN }
        if (error.response?.status === 401) return { error: EAuthenticationErrorCodes.UNAUTHORIZED }
        return {
          error: 'Failed to fetch user details: ' + (error.response?.data?.error || error.message)
        }
      }
    }
  )
}

export { loadUserServices }
