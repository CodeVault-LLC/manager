import { action, observable, makeObservable } from 'mobx'
// root store
import { CoreRootStore } from './root.store'

type TTheme = 'dark' | 'light'
export interface IThemeStore {
  // observables
  isNewUserPopup: boolean
  theme: 'dark' | 'light'
  isSidebarCollapsed: boolean | undefined
  // actions
  hydrate: (data: any) => void
  toggleNewUserPopup: () => void
  setTheme: (currentTheme: TTheme) => void
}

export class ThemeStore implements IThemeStore {
  // observables
  isNewUserPopup: boolean = false
  isSidebarCollapsed: boolean | undefined = undefined
  theme: 'dark' | 'light' = 'dark'

  constructor(private store: CoreRootStore) {
    const root = window.document.documentElement

    const theme = localStorage.getItem('theme')
    if (theme) this.theme = theme as 'dark' | 'light'

    root.classList.add(this.theme)

    makeObservable(this, {
      // observables
      isNewUserPopup: observable.ref,
      isSidebarCollapsed: observable.ref,
      theme: observable.ref,
      // action
      toggleNewUserPopup: action,
      setTheme: action
    })
  }

  hydrate = (data: 'dark' | 'light') => {
    if (data) this.theme = data
  }

  /**
   * @description Toggle the new user popup modal
   */
  toggleNewUserPopup = () => (this.isNewUserPopup = !this.isNewUserPopup)

  /**
   * @description Sets the user theme and applies it to the platform
   * @param currentTheme
   */
  setTheme = async (currentTheme: TTheme) => {
    try {
      const root = window.document.documentElement

      localStorage.setItem('theme', currentTheme)
      this.theme = currentTheme

      root.classList.remove('dark', 'light')
      root.classList.add(currentTheme)
    } catch (error) {
      console.error('setting user theme error', error)
    }
  }
}
