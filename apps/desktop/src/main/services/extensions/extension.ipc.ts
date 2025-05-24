import { EErrorCodes } from '@shared/helpers'
import { ipcMain } from 'electron'

import logger from '../../logger'

import { extensionService } from './extension.service'

/**
 * Register all IPC handlers related to extensions
 * @description This function registers the IPC handlers for fetching all extensions.
 * It uses the `ipcMain` module from Electron to handle requests from the renderer process.
 * @returns {void}
 *
 * @deprecated This function is not recommended for use in production, still in development.
 */
export const registerExtensionIPC = async () => {
  ipcMain.handle('extensions:getAll', async (_, marketplace = false) => {
    try {
      // If marketplace fetch from the marketplace
      if (marketplace) {
        const extensions = await extensionService.fetchAllExtensions()

        return {
          data: extensions
        }
      }

      // If local, meaning we want our own installed
      const extensions = await extensionService.getInstalledExtensions()

      return {
        data: extensions
      }
    } catch (error) {
      logger.error('Error loading extensions:', error)
      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      }
    }
  })
}
