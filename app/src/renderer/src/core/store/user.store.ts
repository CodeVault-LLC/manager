import { action, observable, runInAction, makeObservable } from 'mobx'
import { IUser } from '@shared/types'
import { CoreRootStore } from './root.store'
import { UserService } from '@shared/services/user'
import { AuthService } from '@shared/services/auth'
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
  reset: () => void
  signOut: () => void
}

export class UserStore implements IUserStore {
  // observables
  isLoading: boolean = true
  userStatus: TUserStatus | undefined = undefined
  isUserLoggedIn: boolean | undefined = undefined
  currentUser: IUser | undefined = undefined
  // services
  userService
  authService

  constructor(private store: CoreRootStore) {
    makeObservable(this, {
      // observables
      isLoading: observable.ref,
      userStatus: observable,
      isUserLoggedIn: observable.ref,
      currentUser: observable,
      // action
      fetchCurrentUser: action,
      reset: action,
      signOut: action
    })
    this.userService = new UserService()
    this.authService = new AuthService()
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
      const currentUser = await this.userService.adminDetails()
      if (currentUser) {
        runInAction(() => {
          this.isUserLoggedIn = true
          this.currentUser = currentUser
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
