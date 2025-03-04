import { action, observable, runInAction, makeObservable } from 'mobx'
import { IUser } from '../../../../../../shared/types'
import { CoreRootStore } from './root.store'
import { EUserStatus, TUserStatus } from '@shared/constants'

export interface IUserStore {
  // observables
  isLoading: boolean
  userStatus: TUserStatus | undefined
  isUserLoggedIn: boolean | undefined
  currentUser: IUser | undefined
  // fetch actions
  hydrate: (data: any) => void
  fetchCurrentUser: () => Promise<IUser>
  login: (email: string, password: string) => Promise<IUser>
  register: (data: any) => Promise<IUser>
  reset: () => void
  signOut: () => void
}

export class UserStore implements IUserStore {
  // observables
  isLoading: boolean = false
  userStatus: TUserStatus | undefined = undefined
  isUserLoggedIn: boolean | undefined = undefined
  currentUser: IUser | undefined = undefined

  constructor(private store: CoreRootStore) {
    makeObservable(this, {
      // observables
      isLoading: observable.ref,
      userStatus: observable,
      isUserLoggedIn: observable.ref,
      currentUser: observable,
      // action
      fetchCurrentUser: action,
      login: action,
      register: action,
      reset: action,
      signOut: action
    })
  }

  hydrate = (data: IUser) => {
    if (data) this.currentUser = data
  }

  /**
   * @description Fetches the current user
   * @returns Promise<IUser>
   */
  fetchCurrentUser = async () => {
    try {
      if (this.currentUser === undefined) this.isLoading = true

      const currentUser = await window.electron.ipcRenderer.invoke('user:adminDetails')

      console.log(currentUser)

      if (currentUser?.user && !currentUser?.error) {
        runInAction(() => {
          this.isUserLoggedIn = true
          this.currentUser = currentUser?.user
          this.isLoading = false
        })
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
        })
      }

      return currentUser
    } catch (error: any) {
      this.isLoading = false
      this.isUserLoggedIn = false
      if (error.status === 403)
        this.userStatus = {
          status: EUserStatus.AUTHENTICATION_NOT_DONE,
          message: error?.message || ''
        }
      else
        this.userStatus = {
          status: EUserStatus.ERROR,
          message: error?.message || ''
        }
      throw error
    }
  }

  /**
   * @description Login in the current user
   * @param {string} email
   * @param {string} password
   * @returns Promise<IUser>
   */
  login = async (email: string, password: string) => {
    try {
      this.isLoading = true
      const currentUser = await window.electron.ipcRenderer.invoke('auth:login', email, password)

      if (currentUser?.user && !currentUser?.error) {
        runInAction(() => {
          this.isUserLoggedIn = true
          this.currentUser = currentUser?.user
          this.isLoading = false
        })
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
        })
      }

      return currentUser
    } catch (error: any) {
      this.isLoading = false
      this.isUserLoggedIn = false
      if (error.status === 403)
        this.userStatus = {
          status: EUserStatus.AUTHENTICATION_NOT_DONE,
          message: error?.message || ''
        }
      else
        this.userStatus = {
          status: EUserStatus.ERROR,
          message: error?.message || ''
        }
      throw error
    }
  }

  /**
   * @description Register the current user
   * @param data any
   * @returns Promise<IUser>
   */
  register: (data: any) => Promise<IUser> = async (data: any) => {
    try {
      this.isLoading = true
      const currentUser = await window.electron.ipcRenderer.invoke('auth:register', data)

      if (currentUser?.user && !currentUser?.error) {
        runInAction(() => {
          this.isUserLoggedIn = true
          this.currentUser = currentUser?.user
          this.isLoading = false
        })
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
        })
      }

      return currentUser
    } catch (error: any) {
      this.isLoading = false
      this.isUserLoggedIn = false
      if (error.status === 403)
        this.userStatus = {
          status: EUserStatus.AUTHENTICATION_NOT_DONE,
          message: error?.message || ''
        }
      else
        this.userStatus = {
          status: EUserStatus.ERROR,
          message: error?.message || ''
        }
      throw error
    }
  }

  reset = async () => {
    this.isUserLoggedIn = false
    this.currentUser = undefined
    this.isLoading = false
    this.userStatus = undefined
  }

  signOut = async () => {
    this.store.resetOnSignOut()
  }
}
