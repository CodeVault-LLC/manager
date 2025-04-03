import { handleGoogleAuthCallback } from './services/integrations/google.service'

// Function to handle deep link callback
const handleDeepLink = async (url: string) => {
  try {
    const urlObj = new URL(url.replace('managerapp://', 'https://managerapp/'))
    console.log('Received deep link:', urlObj)

    if (urlObj.pathname === '/auth/google/callback') {
      handleGoogleAuthCallback(urlObj)
    }
  } catch (error) {
    console.error('Error handling deep link:', error)
  }
}

export default handleDeepLink
