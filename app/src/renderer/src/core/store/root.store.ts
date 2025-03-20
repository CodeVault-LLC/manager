import { enableStaticRendering } from 'mobx-react'
// stores
import { IThemeStore, ThemeStore } from './theme.store'
import { IUserStore, UserStore } from './user.store'
import { IWorkspaceStore, WorkspaceStore } from './workspace.store'
import { ErrorStore, IErrorStore } from './error.store'

enableStaticRendering(typeof window === 'undefined')

export abstract class CoreRootStore {
  theme: IThemeStore
  user: IUserStore
  workspace: IWorkspaceStore
  error: IErrorStore

  constructor() {
    this.theme = new ThemeStore(this)
    this.user = new UserStore(this)
    this.workspace = new WorkspaceStore(this)
    this.error = new ErrorStore(this)
  }

  hydrate(initialData: any) {
    this.theme.hydrate(initialData.theme)
    this.user.hydrate(initialData.user)
    this.workspace.hydrate(initialData.workspace)
    this.error.hydrate(initialData.error)
  }

  resetOnSignOut() {
    localStorage.setItem('theme', 'dark')
    this.user = new UserStore(this)
    this.theme = new ThemeStore(this)
    this.workspace = new WorkspaceStore(this)

    window.location.href = '/'
  }
}
