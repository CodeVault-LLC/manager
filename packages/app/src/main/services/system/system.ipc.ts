import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain, shell } from 'electron'
import { ConfStorage } from '@main/store'
import { ETheme, ISystem, ISystemHardware } from '@shared/types/system'
import logger from '@main/logger'
import { systemServices } from './system.service'
import { registerBrowserIPC } from './browser.ipc'

export const registerSystemIPC = () => {
  ipcMain.handle(
    'system:initial',
    async (): Promise<
      TCommunicationResponse<{ theme: ETheme; language: string }>
    > => {
      try {
        const theme = (await ConfStorage.getSecureData('theme')) ?? ETheme.LIGHT
        const language = (await ConfStorage.getSecureData('language')) ?? 'en'

        return { data: { theme, language } }
      } catch (error: any) {
        logger.error(
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
    'system:setSystem',
    async (_, system: ISystem): Promise<TCommunicationResponse<boolean>> => {
      try {
        await ConfStorage.setSecureData('theme', system.theme)
        await ConfStorage.setSecureData('language', system.language)

        return { data: true }
      } catch (error: any) {
        logger.error(`Error while setting system data: ${error.message}`, error)

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
    'system:getHardware',
    async (): Promise<TCommunicationResponse<ISystemHardware>> => {
      try {
        const hardware = await systemServices.getSystemHardware()

        logger.debug('System hardware data', {
          hardware
        })

        return { data: hardware }
      } catch (error: any) {
        logger.error(
          `Error while getting system hardware data: ${error.message}`,
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
    'system:openExternal',
    async (_, url: string): Promise<TCommunicationResponse<boolean>> => {
      try {
        const validUrl = new URL(url)
        if (!validUrl.protocol.startsWith('http')) {
          throw new Error('Invalid URL protocol')
        }

        await shell.openExternal(validUrl.href)

        return { data: true }
      } catch (error: any) {
        logger.error(
          `Error while opening external link: ${error.message}`,
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

  registerBrowserIPC()
}
