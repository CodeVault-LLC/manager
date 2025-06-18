import { ipcMain } from 'electron'
import {
  EErrorCodes,
  TCommunicationResponse,
  Timesery
} from '@manager/common/src'
import { weatherServices } from './weather.service'

export const registerWeatherIPC = async () => {
  ipcMain.handle(
    'weather:current',
    async (): Promise<TCommunicationResponse<Timesery[]>> => {
      try {
        const weather = await weatherServices.getLatestWeather()

        if (weather.length === 0) {
          const weather = await weatherServices.requestLatestWeather()

          return {
            data: weather
          }
        }

        return {
          data: weather
        }
      } catch (error) {
        log.error('Failed to fetch news', error)

        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )
}
