import { createRoot } from 'react-dom/client'
import './index.css'
import { createRouter } from './router'
import { RouterProvider } from '@tanstack/react-router'
import { ElectronAPI } from '@electron-toolkit/preload'
import { Translations } from '@shared/types/i18n'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown

    i18n: {
      getLocale: () => Translations
      setLocale: (lang: string) => Translations
    }
  }
}

const router = createRouter()

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(<RouterProvider router={router} />)
