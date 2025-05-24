import { EErrorCodes } from '@shared/helpers'
import { ipcMain } from 'electron'

export const googleServices = {
  handleGoogleAuthCallback: (urlObj: URL) => {
    const success = urlObj.searchParams.get('success')

    if (success) {
      ipcMain.emit('auth:google:callback', {
        data: true
      })
    } else {
      ipcMain.emit('auth:google:callback', {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      })
    }
  }
}
