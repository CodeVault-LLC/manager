import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

import { exposeToMainWorld } from './i18n'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    const listeners = (channel: string) => {
      const listenerList = ipcRenderer.listeners(channel)

      if (listenerList) {
        return listenerList
      } else {
        return []
      }
    }

    const electronAPIC = {
      ...electronAPI,
      ipcRenderer: {
        ...electronAPI.ipcRenderer,
        listeners
      }
    }

    contextBridge.exposeInMainWorld('electron', electronAPIC)
    contextBridge.exposeInMainWorld('api', api)

    exposeToMainWorld()
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
