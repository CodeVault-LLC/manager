import { handleGoogleAuthCallback } from './services/integrations/google.service'

// Function to handle deep link callback
const handleDeepLink = async (url: string) => {
  try {
    const urlObj = new URL(url)
    if (urlObj.pathname === '/auth/google/callback') {
      handleGoogleAuthCallback(urlObj)
    }
  } catch (error) {
    console.error('Error handling deep link:', error)
  }
}

export default handleDeepLink
