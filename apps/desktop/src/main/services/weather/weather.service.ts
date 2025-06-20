import axios from 'axios'
import { SessionStorage } from '../../lib/session'
import { IGeoLocation, IWeather } from '@manager/common/src'

const yrApi = axios.create({
  baseURL: 'https://api.met.no/weatherapi/locationforecast/2.0/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'Manager Desktop App'
  }
})

yrApi.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    log.error('Error fetching weather from Weather API', {
      error: error.message
    })
    return Promise.reject(error)
  }
)

export const weatherServices = {
  getLatestWeather: async () => {
    try {
      const weather = SessionStorage.getInstance().getItem<IWeather>('weather')

      if (weather) {
        return weather.properties.timeseries
      }

      return []
    } catch (error) {
      log.error('Error getting latest weather', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  },

  requestLatestWeather: async () => {
    try {
      const geoLocation =
        SessionStorage.getInstance().getItem<IGeoLocation>('geolocation')

      const lat = parseFloat(geoLocation?.loc.split(',')[0] ?? '60')
      const lon = parseFloat(geoLocation?.loc.split(',')[1] ?? '11')

      const response = await yrApi.get<IWeather>(
        `compact?lat=${lat}&lon=${lon}&altitude=0`
      )

      if (response.status !== 200) {
        throw new Error('Error fetching weather from Weather API')
      }

      // store the weather data as session storage
      SessionStorage.getInstance().setItem('weather', response.data, 10 * 60) // 10 minutes TTL

      return response.data.properties.timeseries
    } catch (error) {
      log.error('Error requesting latest weather', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}
