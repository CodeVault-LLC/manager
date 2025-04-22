import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain } from 'electron'
import { ConfStorage } from '../../store'
import { ETheme, ISystem } from '@shared/types/system'
import { loadBrowserServices } from './browser.service'

export const loadSystemServices = () => {
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
        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )

  loadBrowserServices()
}
