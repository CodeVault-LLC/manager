import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

import { exposeToMainWorld } from './i18n'

// Extend the Window interface to include 'electron' and 'api'
declare global {
  interface Window {
    electron: typeof electronAPI
    api: typeof api
  }
}

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

    contextBridge.exposeInMainWorld('electron', {
      invoke: ipcRenderer.invoke.bind(ipcRenderer),
      send: ipcRenderer.send.bind(ipcRenderer),
      on: ipcRenderer.on.bind(ipcRenderer),
      once: ipcRenderer.once.bind(ipcRenderer),
      removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
      removeListener: ipcRenderer.removeListener.bind(ipcRenderer),

      listeners
    })

    exposeToMainWorld()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
