import { ipcMain, shell } from 'electron'

import { ConfStorage } from '@main/store'
import { manager } from '../../grpc/service-manager'
import {
  EErrorCodes,
  ETheme,
  IApplication,
  IGeoLocation,
  IpcServiceLog,
  TCommunicationResponse
} from '@manager/common/src'
import { ProcessService } from '../../lib/process'
import { SessionStorage } from '../../lib/session'

/**
 * Register all IPC handlers related to application settings
 * @description This function registers the IPC handlers for application settings.
 * It uses the `ipcMain` module from Electron to handle requests from the renderer process.
 * @returns {void}
 */
export const registerApplicationIPC = () => {
  ipcMain.handle('application:initial', async () => {
    try {
      const theme = (await ConfStorage.get('theme')) ?? ETheme.LIGHT
      const language = (await ConfStorage.get('language')) ?? 'en'

      const geolocation =
        await ProcessService.getInstance().runTask<IGeoLocation>(
          'getGeoLocation'
        )

      log.info(
        `System initial data: theme=${theme}, language=${language}, geolocation=${JSON.stringify(
          geolocation
        )}`
      )

      SessionStorage.getInstance().setItem('geolocation', geolocation)

      return { data: { theme, language, geolocation } }
    } catch (error: any) {
      log.error(
        `Error while getting system initial data: ${error.message}`,
        error
      )

      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      }
    }
  })

  ipcMain.handle(
    'application:setAppSettings',
    async (
      _,
      application: IApplication
    ): Promise<TCommunicationResponse<boolean>> => {
      try {
        await ConfStorage.set('theme', application.theme)
        await ConfStorage.set('language', application.language)

        return { data: true }
      } catch (error: any) {
        log.error(`Error while setting system data: ${error.message}`, error)

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
    'application:openExternal',
    async (_, url: string): Promise<TCommunicationResponse<boolean>> => {
      try {
        const validUrl = new URL(url)
        if (!validUrl.protocol.startsWith('http')) {
          throw new Error('Invalid URL protocol')
        }

        await shell.openExternal(validUrl.href)

        return { data: true }
      } catch (error: any) {
        log.error(`Error while opening external link: ${error.message}`, error)

        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )

  ipcMain.handle('application:serviceStatus', async () => {
    const services = await manager.getServiceStatus()

    return { data: services }
  })

  ipcMain.handle('application:serviceLogs', async () => {
    const logs: IpcServiceLog[] = await manager.getServiceLogs()
    return { data: logs }
  })
}
