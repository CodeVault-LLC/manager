import { ipcMain, shell } from 'electron'
import { api } from '@main/services/api.service'
import { EErrorCodes, TCommunicationResponse } from '@manager/common/src'

export const registerGoogleIPC = () => {
  ipcMain.handle(
    'auth:google',
    async (): Promise<TCommunicationResponse<boolean>> => {
      try {
        const authUrlResponse = await api.get<{ authURL: string }>(
          '/users/google/auth'
        )
        const authUrl = authUrlResponse.data.authURL

        void shell.openExternal(authUrl)

        return {
          data: true
        }
      } catch (error) {
        log.error('Error while trying to open Google authentication URL', error)
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
      } catch (error) {
        log.error('Error while trying to revoke Google authentication', error)
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
