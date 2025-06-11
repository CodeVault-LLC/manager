import { ipcClient } from '@renderer/utils/ipcClient'
import { create } from 'zustand'

import {
  ETheme,
  IApplicationUpdate,
  IpcServiceLog,
  IServiceStatus
} from '@manager/common/src'

interface ITheme {
  id: ETheme
  name: string
  previewColor: string
}

interface ILanguage {
  code: string
  name: string
  flag: string
}

interface IApplicationStore {
  theme: ETheme
  language: string

  status: IServiceStatus[]
  logs: IpcServiceLog[]

  themes: ITheme[]
  languages: ILanguage[]
  update: IApplicationUpdate | null
  updateProgress: number

  fetchInitialSettings: () => Promise<void>

  fetchServiceStatus: () => Promise<void>
  fetchServiceLogs: () => Promise<void>

  setHtmlTheme: (theme: ETheme) => void

  setTheme: (theme: ETheme) => Promise<void>
  setLanguage: (language: string) => Promise<void>

  openExternalLink: (url: string) => Promise<void>

  doUpdateAction: (data: boolean) => Promise<void>
  subscribeToUpdateStatus: () => void
  unsubscribeFromUpdateStatus: () => void
  subscribeToUpdateProgress: (callback: (progress: number) => void) => void
}

export const useApplicationStore = create<IApplicationStore>((set, get) => ({
  theme: ETheme.SYSTEM,
  language: 'en',
  status: [],
  logs: [],
  update: null,
  updateProgress: 0,

  themes: [
    { id: ETheme.SYSTEM, name: 'System', previewColor: '#ffffff' },
    { id: ETheme.LIGHT, name: 'Light', previewColor: '#ffffff' },
    { id: ETheme.DARK, name: 'Dark', previewColor: '#000000' }
  ],

  languages: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' }
  ],

  fetchInitialSettings: async () => {
    try {
      const system = await ipcClient.invoke('application:initial')

      if (system.data) {
        const { theme, language } = system.data

        set({ theme, language })
        get().setHtmlTheme(theme)
      }

      if (system.error) {
        // eslint-disable-next-line no-console
        console.error('getting initial system data error', system.error)
        return
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('getting initial system data error', error)
    }
  },

  doUpdateAction: async (data: boolean) => {
    try {
      const response = await ipcClient.invoke('application:updateAction', data)

      if (response.error) {
        // eslint-disable-next-line no-console
        console.error('updating application action error', response.error)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('updating application action error', error)
    }
  },

  subscribeToUpdateStatus: () => {
    ipcClient.on(
      'application:updateStatus',
      (_event: any, update: IApplicationUpdate) => {
        set({ update })
      }
    )
  },
  unsubscribeFromUpdateStatus: () => {
    ipcClient.removeAll('application:updateStatus')
    set({ update: null })
  },

  subscribeToUpdateProgress: (callback: (progress: number) => void) => {
    ipcClient.on(
      'application:updateDownloadProgress',
      (_event: any, progress: number) => {
        set({ updateProgress: progress })
        callback(progress)
      }
    )
  },

  setHtmlTheme: (theme: ETheme) => {
    const root = window.document.documentElement

    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  },

  setTheme: async (theme: ETheme) => {
    try {
      set({ theme })
      await ipcClient.invoke('application:setAppSettings', {
        language: get().language,
        theme
      })

      get().setHtmlTheme(theme)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('setting user theme error', error)
    }
  },

  fetchServiceStatus: async () => {
    try {
      const status = await ipcClient.invoke('application:serviceStatus')

      if (status.data) {
        set({ status: status.data })
      }

      if (status.error) {
        // eslint-disable-next-line no-console
        console.error('getting service status error', status.error)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('getting service status error', error)
    }
  },

  fetchServiceLogs: async () => {
    try {
      const logs = await ipcClient.invoke('application:serviceLogs')

      if (logs.data) {
        set({ logs: logs.data })
      }

      if (logs.error) {
        // eslint-disable-next-line no-console
        console.error('getting service logs error', logs.error)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('getting service logs error', error)
    }
  },

  setLanguage: async (language: string) => {
    try {
      set({ language }) // eslint-disable-next-line no-console
      console.log('setting user language', language)
      await ipcClient.invoke('application:setAppSettings', {
        language,
        theme: get().theme
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('setting user language error', error)
    }
  },

  openExternalLink: async (url: string) => {
    try {
      await ipcClient.invoke('application:openExternal', url)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('opening external link error', error)
    }
  }
}))
