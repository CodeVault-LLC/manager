import { IUser } from '@shared/types/users'
import { ipcMain } from 'electron'
import { api } from './api.service'
import { EAuthenticationErrorCodes } from '@shared/helpers'
import { ICommunicationResponse } from '@shared/types/communication'

const loadUserServices = () => {
  ipcMain.handle('user:adminDetails', async (): Promise<ICommunicationResponse> => {
    try {
      const response = await api.get<IUser>('/users/me/')

      return { user: response.data }
    } catch (error: any) {
      if (error.response?.status === 403) return { error: EAuthenticationErrorCodes.FORBIDDEN }
      if (error.response?.status === 401) return { error: EAuthenticationErrorCodes.UNAUTHORIZED }
      return {
        error: 'Failed to fetch user details: ' + (error.response?.data?.error || error.message)
      }
    }
  })
}

export { loadUserServices }
