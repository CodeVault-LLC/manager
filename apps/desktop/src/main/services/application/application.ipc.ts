import { ipcMain, shell } from 'electron'

import log from '@main/logger'
import { ConfStorage } from '@main/store'
import { manager } from '../../grpc/service-manager'
import {
  EErrorCodes,
  ETheme,
  IApplication,
  IpcServiceLog,
  TCommunicationResponse
} from '@manager/common/src'

/**
 * Register all IPC handlers related to application settings
 * @description This function registers the IPC handlers for application settings.
 * It uses the `ipcMain` module from Electron to handle requests from the renderer process.
 * @returns {void}
 */
export const registerApplicationIPC = () => {
  ipcMain.handle(
    'application:initial',
    async (): Promise<
      TCommunicationResponse<{ theme: ETheme; language: string }>
    > => {
      try {
        const theme = (await ConfStorage.getSecureData('theme')) ?? ETheme.LIGHT
        const language = (await ConfStorage.getSecureData('language')) ?? 'en'

        return { data: { theme, language } }
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
    }
  )

  ipcMain.handle(
    'application:setAppSettings',
    async (
      _,
      application: IApplication
    ): Promise<TCommunicationResponse<boolean>> => {
      try {
        await ConfStorage.setSecureData('theme', application.theme)
        await ConfStorage.setSecureData('language', application.language)

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
