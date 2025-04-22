import { action, observable, makeObservable } from 'mobx'
// root store
import { CoreRootStore } from './root.store'
import {
  ETheme,
  IBrowser,
  ISystem,
  ISystemStatistics
} from '@shared/types/system'
import { ipcClient } from '@renderer/utils/ipcClient'

export interface ISystemStore {
  // observables
  isNewUserPopup: boolean
  system: ISystem

  browsers: IBrowser[]

  systemStatistics: ISystemStatistics

  // actions
  hydrate: (data: any) => void
  toggleNewUserPopup: () => void

  setTheme: (theme: ETheme) => void
  setLanguage: (language: string) => void

  getBrowserInitial(): void
  doBrowserRefresh(): void

  getInitialData: () => void
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

  browsers: IBrowser[] = []

  systemStatistics: ISystemStatistics = {
    cpu: 0,
    memory: 0,
    disk: [],
    uptime: 0,
    pid: 0
  }

  constructor(public store: CoreRootStore) {
    makeObservable(this, {
      // observables
      isNewUserPopup: observable.ref,
      system: observable.shallow,
      systemStatistics: observable.shallow,

      // action
      toggleNewUserPopup: action,
      setTheme: action
    })

    ipcClient.on('system:statistics', (data) => {
      console.log('System statistics', data)
      this.systemStatistics = data as unknown as ISystemStatistics
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
  getInitialData = async () => {
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
        console.log('Browser initial', response.data)
        this.setBrowsers(response.data)
      } else {
        console.error('getting initial browser data error', response.error)
      }
    })
  }

  doBrowserRefresh = (): void => {
    ipcClient.invoke('browser:refresh').then((response) => {
      if (response.data) {
        console.log('Browser refresh', response.data)
        this.setBrowsers(response.data)
      } else {
        console.error('getting initial browser data error', response.error)
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
}
