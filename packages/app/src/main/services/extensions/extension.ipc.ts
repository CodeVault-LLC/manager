import { EErrorCodes } from '@shared/helpers'
import { ipcMain } from 'electron'
import { extensionService } from './extension.service'

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
      console.error('Error loading extensions:', error)
      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      }
    }
  })
}
