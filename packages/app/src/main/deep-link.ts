import { googleServices } from './services/integrations/google'

const handleDeepLink = async (url: string) => {
  try {
    const urlObj = new URL(url.replace('managerapp://', 'https://managerapp/'))
    console.log('Received deep link:', urlObj)

    if (urlObj.pathname === '/auth/google/callback') {
      googleServices.handleGoogleAuthCallback(urlObj)
    }
  } catch (error) {
    console.error('Error handling deep link:', error)
  }
}

export default handleDeepLink
