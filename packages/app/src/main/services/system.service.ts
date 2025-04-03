import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain } from 'electron'
import { ConfStorage } from '../store'
import { ETheme, ISystem } from '@shared/types/system'

export const loadSystemServices = () => {
  ipcMain.handle(
    'system:initial',
    async (): Promise<
      TCommunicationResponse<{ theme: ETheme; language: string }>
    > => {
      try {
        const theme = await ConfStorage.getSecureData('theme')
        const language = await ConfStorage.getSecureData('language')

        return { data: { theme, language } }
      } catch (error: any) {
        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'You do not have permission to access this resource'
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
            message: 'You do not have permission to access this resource'
          }
        }
      }
    }
  )
}
