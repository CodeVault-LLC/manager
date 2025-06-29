import { ipcMain } from 'electron'
import {
  EErrorCodes,
  INetwork,
  ISystem,
  ISystemHardware,
  TCommunicationResponse
} from '@manager/common/src'
import { registerBrowserIPC } from './browser.ipc'
import { systemServices } from './system.service'
import { ProcessService } from '../../lib/process'

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

        log.debug('System info data', systemInfo)

        return { data: systemInfo }
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error while getting system info data:', error)

        log.error('Errror while getting system info data: ', error)

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

        log.debug('System hardware data', {
          hardware
        })

        return { data: hardware }
      } catch (error: any) {
        log.error(
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
    'system:storageOverview',
    async (): Promise<TCommunicationResponse<any>> => {
      try {
        const storageOverview = await systemServices.getStorageOverview()

        return { data: storageOverview }
      } catch (error: any) {
        log.error(
          `Error while getting storage overview data: ${error.message}`,
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
    'system:getNetwork',
    async (): Promise<TCommunicationResponse<INetwork>> => {
      try {
        const network =
          await ProcessService.getInstance().runTask<INetwork>('getNetwork')

        if (!network) {
          log.error('Network data is empty or undefined')

          return {
            error: {
              code: EErrorCodes.FORBIDDEN,
              message: 'error.forbidden'
            }
          }
        }

        return { data: network }
      } catch (error: any) {
        log.error(`Error while getting system network data: ${error}`, error)

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
