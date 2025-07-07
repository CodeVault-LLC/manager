import { IpcRenderer } from '@electron-toolkit/preload'
import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import './index.css'
import { createRouter } from './router'

declare global {
  interface Window {
    electron: IpcRenderer & {
      dialog: {
        showOpenDialog: (
          options: Electron.OpenDialogOptions
        ) => Promise<Electron.OpenDialogReturnValue>
      }
    }
    api: unknown
  }
}

const router = createRouter()

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(<RouterProvider router={router} />)
