import { createRoot } from 'react-dom/client'
import './index.css'
import { createRouter } from './router'
import { RouterProvider } from '@tanstack/react-router'
import { StoreProvider } from './utils/store-context'
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown

    i18n: {
      getLocale: () => Translations;
      setLocale: (lang: Locale) => Translations;
    }
  }
}

const router = createRouter()

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StoreProvider>
    <RouterProvider router={router} />
  </StoreProvider>
)
