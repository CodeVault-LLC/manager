import logger from './logger'
import { googleServices } from './services/integrations/google'

const handleDeepLink = async (url: string) => {
  try {
    const urlObj = new URL(url.replace('managerapp://', 'https://managerapp/'))
    logger.debug('Handling deep link:', urlObj)

    if (urlObj.pathname === '/auth/google/callback') {
      googleServices.handleGoogleAuthCallback(urlObj)
    }
  } catch (error) {
    logger.error('Error handling deep link:', error)
  }
}

export default handleDeepLink
