import httpClient from '../../lib/http/httpClient'
import { getCache, setCache } from '../../lib/cache'
import { I7DayForecast, I7DayForecastTimesery } from '@manager/common/src'

export const BASE_URL = 'https://api.met.no'

export * from './current-forecast'

export const getForecastFor7Days = async (
  lat: number,
  lon: number
): Promise<I7DayForecastTimesery[]> => {
  try {
    const cacheKey = `met:7day-forecast:${lat},${lon}`
    const cached = getCache<I7DayForecastTimesery[]>(cacheKey)
    if (cached) return cached

    const url = `${BASE_URL}/weatherapi/locationforecast/2.0/complete`

    const response = await httpClient.get<I7DayForecast>(url, {
      params: { lat, lon }
    })

    const data = response.data.properties.timeseries
    setCache(cacheKey, data, 60 * 60 * 1000) // Cache for 1 hour

    return data
  } catch (error) {
    log.error('Failed to fetch 7-day forecast', error)
    throw error
  }
}
