import { action, observable, runInAction, makeObservable } from 'mobx'
import { IAvatarWithBuffer, IRegistrationData, IUser } from '../../../../../../shared/types'
import { CoreRootStore } from './root.store'
import { EUserStatus, TUserStatus } from '@shared/constants'
import { toast } from 'sonner'

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
      currentUser: observable.ref,
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
      if (this.isLoading) return
      if (this.isUserLoggedIn) return this.currentUser
      if (!this.currentUser?.id) this.isLoading = true

      const currentUser = await window.electron.ipcRenderer.invoke('user:adminDetails')

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
          toast.error(currentUser?.error)
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
  register: (data: IRegistrationData) => Promise<IUser> = async (data: IRegistrationData) => {
    try {
      this.isLoading = true

      // Handle file conversion for IPC transfer
      let dataToSend = { ...data } as IRegistrationData & { avatar?: IAvatarWithBuffer }

      // If there's an avatar file, prepare it for IPC transfer
      if (data.avatar instanceof File && data.avatar.size > 0) {
        const fileBuffer = await new Promise<ArrayBuffer>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as ArrayBuffer)

          if (data.avatar instanceof File) reader.readAsArrayBuffer(data.avatar)
        })

        // Create a transferable object with file metadata
        dataToSend.avatar = {
          name: data.avatar.name,
          type: data.avatar.type,
          size: data.avatar.size,
          lastModified: data.avatar.lastModified,
          buffer: Array.from(new Uint8Array(fileBuffer)) // Convert to array for safe IPC transfer
        }
      }

      const currentUser = await window.electron.ipcRenderer.invoke('auth:register', dataToSend)

      if (currentUser?.user && !currentUser?.error) {
        runInAction(() => {
          this.isUserLoggedIn = true
          this.currentUser = currentUser?.user
          this.isLoading = false
          toast.success('Registration successful!')
        })
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
          toast.error(currentUser?.error || 'Registration failed')
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

      toast.error(error?.message || 'Registration failed')
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
