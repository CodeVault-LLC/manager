import { enableStaticRendering } from 'mobx-react'
// stores
import { IThemeStore, ThemeStore } from './theme.store'
import { IUserStore, UserStore } from './user.store'
import { IWorkspaceStore, WorkspaceStore } from './workspace.store'

enableStaticRendering(typeof window === 'undefined')

export abstract class CoreRootStore {
  theme: IThemeStore
  user: IUserStore
  workspace: IWorkspaceStore

  constructor() {
    this.theme = new ThemeStore(this)
    this.user = new UserStore(this)
    this.workspace = new WorkspaceStore(this)
  }

  hydrate(initialData: any) {
    this.theme.hydrate(initialData.theme)
    this.user.hydrate(initialData.user)
    this.workspace.hydrate(initialData.workspace)
  }

  resetOnSignOut() {
    localStorage.setItem('theme', 'light')
    this.user = new UserStore(this)
    this.theme = new ThemeStore(this)
    this.workspace = new WorkspaceStore(this)
  }
}
