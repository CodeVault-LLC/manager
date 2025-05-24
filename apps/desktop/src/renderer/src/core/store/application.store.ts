import { ipcClient } from '@renderer/utils/ipcClient'
import { ETheme } from '@shared/types/application'
import { create } from 'zustand'

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

  themes: ITheme[]
  languages: ILanguage[]

  fetchInitialSettings: () => Promise<void>
  setHtmlTheme: (theme: ETheme) => void

  setTheme: (theme: ETheme) => Promise<void>
  setLanguage: (language: string) => Promise<void>

  openExternalLink: (url: string) => Promise<void>
}

export const useApplicationStore = create<IApplicationStore>((set, get) => ({
  theme: ETheme.SYSTEM,
  language: 'en',

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
