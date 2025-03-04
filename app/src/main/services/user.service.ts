import { IUser } from '@shared/types/users'
import { ipcMain } from 'electron'
import { api } from './api.service'
import { EAuthenticationErrorCodes } from '@shared/helpers'

const loadUserServices = () => {
  ipcMain.handle('user:adminDetails', async () => {
    try {
      const response = await api.get<IUser>('/users/me/')

      if (response.status === 200) return { user: response.data }
      return { error: EAuthenticationErrorCodes.UNAUTHORIZED }
    } catch (error: any) {
      console.log(error.response.status)

      if (error.response?.status === 403) return { error: EAuthenticationErrorCodes.FORBIDDEN }
      if (error.response?.status === 401) return { error: EAuthenticationErrorCodes.UNAUTHORIZED }
      return {}
    }
  })
}

export { loadUserServices }
