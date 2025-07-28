import { ICurrentForecast, ICurrentForecastTimesery } from '@manager/common/src'
import { getCache, setCache } from '../../lib/cache'
import httpClient from '../../lib/http/httpClient'
import { BASE_URL } from './met-service'

export const getCurrentForecast = async (
  lat: number,
  lon: number
): Promise<ICurrentForecastTimesery[]> => {
  try {
    const cacheKey = `met:forecast:${lat},${lon}`
    const cached = getCache<ICurrentForecastTimesery[]>(cacheKey)
    if (cached) return cached

    const url = `${BASE_URL}/weatherapi/locationforecast/2.0/compact`

    const response = await httpClient.get<ICurrentForecast>(url, {
      params: { lat, lon }
    })

    const data = response.data.properties.timeseries
    setCache(cacheKey, data, 5 * 60 * 1000) // Cache for 5 minutes

    return data
  } catch (error) {
    log.error('Failed to fetch current weather', error)
    throw error
  }
}
