import { ipcMain } from 'electron'
import {
  EErrorCodes,
  ISystem,
  ISystemHardware,
  TCommunicationResponse
} from '@manager/common/src'
import { registerBrowserIPC } from './browser.ipc'
import { systemServices } from './system.service'
import logger from '@main/logger'

/**
 * Register all IPC handlers related to system management
 * @description This function registers the IPC handlers for system-related actions.
 * It uses the `ipcMain` module from Electron to handle requests from the renderer process.
 * @returns {void}
 */
export const registerSystemIPC = () => {
  ipcMain.handle(
    'system:getSystemInfo',
    async (): Promise<TCommunicationResponse<ISystem>> => {
      try {
        const systemInfo = await systemServices.getSystemInfo()

        logger.debug('System info data', {
          systemInfo
        })

        return { data: systemInfo }
      } catch (error: any) {
        logger.error(
          `Error while getting system info data: ${error.message}`,
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

  void registerBrowserIPC()
}
