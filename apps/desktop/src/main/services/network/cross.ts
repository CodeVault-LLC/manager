import { IGeoLocation } from '@manager/common/src'
import { INetworkProvider } from './network'
import { ProcessService } from '../../lib/process'

ProcessService.getInstance().registerTask<IGeoLocation>(
  'getGeoLocation',
  'all',
  async () => {
    return getGeoLocation()
  }
)

const getGeoLocation: INetworkProvider['getGeoLocation'] = async () => {
  const defaultGeoLocation: IGeoLocation = {
    ip: '127.0.0.1',
    hostname: 'localhost',
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
    loc: '0,0',
    org: 'Unknown',
    postal: '00000',
    timezone: 'UTC',
    readme: 'https://ipinfo.io/missingauth'
  }

  try {
    const response = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      log.warn(`Failed to fetch geolocation data: ${response.statusText}`)
      return defaultGeoLocation
    }

    const geoData: IGeoLocation = await response.json()

    if (!geoData || !geoData.loc) {
      log.warn('No geolocation data found. Returning default values.')
      return defaultGeoLocation
    }

    const [latitude, longitude] = geoData.loc.split(',').map(parseFloat)

    if (isNaN(latitude) || isNaN(longitude)) {
      log.warn('Invalid geolocation coordinates. Returning default values.')
      return defaultGeoLocation
    }

    return {
      ...geoData,
      loc: `${latitude},${longitude}`
    }
  } catch (error) {
    log.error(`Error getting geolocation on Windows: ${error}`)
    return defaultGeoLocation
  }
}
