import { IOpenStreetMapReverse } from '@manager/common/src'
import { getCache, setCache } from '../../lib/cache'
import httpClient from '../../lib/http/httpClient'

const BASE_URL = 'https://nominatim.openstreetmap.org'

export const getLocationByLatLon = async (lat: number, lon: number) => {
  try {
    const cacheKey = `openstreetmap:reverse:${lat},${lon}`
    const cached = getCache<IOpenStreetMapReverse>(cacheKey)
    if (cached) return cached

    const url = `${BASE_URL}/reverse`

    const response = await httpClient.get<IOpenStreetMapReverse>(url, {
      params: { lat, lon, format: 'json' }
    })

    const data = response.data
    setCache(cacheKey, data, 5 * 60 * 1000) // Cache for 5 minutes

    console.log(data)

    return data
  } catch (error) {
    log.error('Failed to fetch location by latitude and longitude', error)
    throw error
  }
}
