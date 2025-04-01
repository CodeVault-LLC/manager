import { ipcMain, shell } from 'electron'
import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { api } from '../api.service'

const loadGoogleServices = () => {
  ipcMain.handle(
    'auth:google',
    async (): Promise<TCommunicationResponse<boolean>> => {
      try {
        const authUrlResponse = await api.get<{ authURL: string }>(
          '/users/google/auth'
        )
        const authUrl = authUrlResponse.data.authURL

        shell.openExternal(authUrl)

        return {
          data: true
        }
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

  ipcMain.handle(
    'auth:google:revoke',
    async (): Promise<TCommunicationResponse<boolean>> => {
      try {
        const revokeResponse = await api.post<{ revoked: boolean }>(
          '/users/google/revoke'
        )
        const revoked = revokeResponse.data.revoked

        return {
          data: revoked
        }
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

const handleGoogleAuthCallback = (urlObj: URL) => {
  const success = urlObj.searchParams.get('success')
  console.log('success', success)

  if (success) {
    ipcMain.emit('auth:google:callback', {
      data: true
    })
  } else {
    ipcMain.emit('auth:google:callback', {
      error: {
        code: EErrorCodes.FORBIDDEN,
        message: 'You do not have permission to access this resource'
      }
    })
  }
}

export { loadGoogleServices, handleGoogleAuthCallback }
