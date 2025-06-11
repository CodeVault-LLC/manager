import { googleServices } from './services/integrations/google'

const handleDeepLink = async (url: string) => {
  try {
    const urlObj = new URL(url.replace('managerapp://', 'https://managerapp/'))
    log.info('Handling deep link:', urlObj)

    if (urlObj.pathname === '/auth/google/callback') {
      googleServices.handleGoogleAuthCallback(urlObj)
    }
  } catch (error) {
    log.error('Failed to handle deep link:', error)
  }
}

export default handleDeepLink
