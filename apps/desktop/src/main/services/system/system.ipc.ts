import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain } from 'electron'
import { ISystemHardware } from '@shared/types/system'
import logger from '@main/logger'
import { systemServices } from './system.service'
import { registerBrowserIPC } from './browser.ipc'

/**
 * Register all IPC handlers related to system management
 * @description This function registers the IPC handlers for system-related actions.
 * It uses the `ipcMain` module from Electron to handle requests from the renderer process.
 * @returns {void}
 */
export const registerSystemIPC = () => {
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

  registerBrowserIPC()
}
