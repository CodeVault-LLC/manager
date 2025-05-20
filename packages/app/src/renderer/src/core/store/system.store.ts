import { action, observable, makeObservable } from 'mobx'
// root store
import { CoreRootStore } from './root.store'
import {
  ETheme,
  IBrowser,
  ISystem,
  ISystemHardware,
  ISystemStatistics
} from '@shared/types/system'
import { ipcClient } from '@renderer/utils/ipcClient'
import { IExtension } from '@shared/types/extension'

export interface ISystemStore {
  // observables
  isNewUserPopup: boolean
  system: ISystem
  hardware: ISystemHardware | null
  inactive: boolean

  extensions: IExtension[]

  browsers: IBrowser[]

  systemStatistics: ISystemStatistics

  // actions
  hydrate: (data: any) => void
  toggleNewUserPopup: () => void

  setTheme: (theme: ETheme) => void
  setLanguage: (language: string) => void

  getBrowserInitial(): void
  doBrowserRefresh(): void

  getExtensions(marketplace?: boolean): void

  subscribeToSystemStatistics(): void
  unsubscribeFromSystemStatistics(): void

  subscribeToSystemInactivity(): void
  unsubscribeFromSystemInactivity(): void

  getSystemHardware(): void

  openExternal: (url: string) => void

  fetchInitial: () => void
}

export class SystemStore implements ISystemStore {
  // observables
  isNewUserPopup: boolean = false
  system: ISystem = {
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
    ]
  }

  inactive: boolean = false

  extensions: IExtension[] = []

  hardware: ISystemHardware | null = null
  browsers: IBrowser[] = []

  systemStatistics: ISystemStatistics = {
    cpu: { current: 0, average: 0 },
    memory: { current: 0, average: 0 },
    disk: { current: 0, average: 0 },
    network: { received: 0, transmitted: 0 },
    uptime: 0,
    pid: 0
  }

  constructor(public store: CoreRootStore) {
    makeObservable(this, {
      // observables
      isNewUserPopup: observable.ref,
      system: observable.shallow,
      hardware: observable.shallow,
      systemStatistics: observable.shallow,

      inactive: observable,
      extensions: observable,

      // action
      toggleNewUserPopup: action,
      setTheme: action,
      setSystemStatistics: action,
      setLanguage: action,

      getExtensions: action,

      subscribeToSystemInactivity: action
    })
  }

  hydrate = (data: any) => {
    if (data) this.system = data
  }

  /**
   * @description Toggle the new user popup modal
   */
  toggleNewUserPopup = () => (this.isNewUserPopup = !this.isNewUserPopup)

  /**
   * @description Sets the user theme and applies it to the platform
   * @param currentTheme
   */
  setTheme = async (currentTheme: ETheme) => {
    try {
      this.system.theme = currentTheme
      this.setHtmlTheme(currentTheme)

      await ipcClient.invoke('system:setSystem', {
        language: this.system.language,
        theme: currentTheme,
        languages: this.system.languages,
        themes: this.system.themes
      })
    } catch (error) {
      console.error('setting user theme error', error)
    }
  }

  /**
   * @description Sets the user language
   * @param currentLanguage
   */
  setLanguage = async (currentLanguage: string) => {
    try {
      this.system.language = currentLanguage

      await ipcClient.invoke('system:setSystem', {
        language: currentLanguage,
        theme: this.system.theme,
        languages: this.system.languages,
        themes: this.system.themes
      })
    } catch (error) {
      console.error('setting user language error', error)
    }
  }

  /**
   * @description Gets the initial system data
   */
  fetchInitial = async () => {
    try {
      const system = await ipcClient.invoke('system:initial')

      if (system.data) {
        this.system.theme = system.data.theme

        this.system.language = system.data.language
        this.setHtmlTheme(system.data.theme)
      }

      if (system.error) {
        console.error('getting initial system data error', system.error)
        return
      }
    } catch (error) {
      console.error('getting initial system data error', error)
    }
  }

  getBrowserInitial = (): void => {
    ipcClient.invoke('browser:initial').then((response) => {
      if (response.data) {
        this.setBrowsers(response.data)
      } else {
        console.error('getting initial browser data error', response.error)
      }
    })
  }

  getSystemHardware = (): void => {
    ipcClient.invoke('system:getHardware').then((response) => {
      if (response.data) {
        this.hardware = response.data
      } else {
        console.error('getting initial system data error', response.error)
      }
    })
  }

  doBrowserRefresh = (): void => {
    ipcClient.invoke('browser:refresh').then((response) => {
      if (response.data) {
        this.setBrowsers(response.data)
      } else {
        console.error('getting initial browser data error', response.error)
      }
    })
  }

  getExtensions(marketplace = false): void {
    ipcClient.invoke('extensions:getAll', marketplace).then((response) => {
      if (response.data) {
        this.extensions = response.data
      } else {
        console.error('getting initial extension data error', response.error)
      }
    })
  }

  /**
   * @description When theme has updated set it as the html attribute
   * @param theme
   */
  setHtmlTheme = (theme: ETheme) => {
    const root = window.document.documentElement

    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }

  setBrowsers = (browsers: IBrowser[]) => {
    this.browsers = browsers
  }

  setSystemStatistics = (data: ISystemStatistics) => {
    this.systemStatistics = data
  }

  subscribeToSystemStatistics = () => {
    const listeners = ipcClient.listeners('system:statistics')
    if (listeners.length > 0) {
      console.warn('Listener already registered for system:statistics')
      return
    }

    ipcClient.on('system:statistics', (_, data) => {
      this.setSystemStatistics(data)
    })
  }

  unsubscribeFromSystemStatistics = () => {
    ipcClient.removeAll('system:statistics')
  }

  subscribeToSystemInactivity = () => {
    const listeners = ipcClient.listeners('system:inactivity')
    if (listeners.length > 0) {
      console.warn('Listener already registered for system:inactivity')
      return
    }

    ipcClient.on('system:inactivity', (_, data) => {
      this.inactive = data.inactive
    })
  }

  unsubscribeFromSystemInactivity = () => {
    ipcClient.removeAll('system:inactivity')
  }

  openExternal = (url: string) => {
    ipcClient.invoke('system:openExternal', url).then((response) => {
      if (response.error) {
        console.error('opening external link error', response.error)
      }
    })
  }
}
