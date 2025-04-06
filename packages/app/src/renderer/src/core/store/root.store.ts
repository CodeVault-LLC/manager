import { enableStaticRendering } from 'mobx-react'
// stores
import { ISystemStore, SystemStore } from './system.store'
import { IUserStore, UserStore } from './user.store'
import { IWorkspaceStore, WorkspaceStore } from './workspace.store'
import { ErrorStore, IErrorStore } from './error.store'
import { INoteStore, NoteStore } from './notes.store'
import { DashboardStore, IDashboardStore } from './dashboard.store'

enableStaticRendering(typeof window === 'undefined')

export abstract class CoreRootStore {
  system: ISystemStore
  user: IUserStore
  workspace: IWorkspaceStore
  error: IErrorStore
  notes: INoteStore
  dashboard: IDashboardStore

  constructor() {
    this.system = new SystemStore(this)
    this.user = new UserStore(this)
    this.workspace = new WorkspaceStore(this)
    this.error = new ErrorStore(this)
    this.notes = new NoteStore(this)
    this.dashboard = new DashboardStore(this)
  }

  hydrate(initialData: any) {
    this.system.hydrate(initialData.theme)
    this.user.hydrate(initialData.user)
    this.workspace.hydrate(initialData.workspace)
    this.error.hydrate(initialData.error)
    this.notes.hydrate(initialData.notes)
    this.dashboard.hydrate(initialData.dashboard)
  }

  resetOnSignOut() {
    localStorage.setItem('theme', 'dark')
    this.user = new UserStore(this)
    this.system = new SystemStore(this)
    this.workspace = new WorkspaceStore(this)
    this.error = new ErrorStore(this)
    this.notes = new NoteStore(this)
    this.dashboard = new DashboardStore(this)

    window.location.href = '/'
  }
}
