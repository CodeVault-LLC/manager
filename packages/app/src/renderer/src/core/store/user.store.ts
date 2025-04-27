import { action, observable, runInAction, makeObservable } from 'mobx'
import {
  IAvatarWithBuffer,
  IRegistrationData,
  ISession,
  IUser
} from '../../../../../../shared/types'
import { CoreRootStore } from './root.store'
import { EUserStatus, TUserStatus } from '@shared/constants'
import { toast } from 'sonner'
import { EErrorCodes } from '@shared/helpers'
import { ipcClient } from '@renderer/utils/ipcClient'

export interface IUserStore {
  // observables
  isLoading: boolean
  userStatus: TUserStatus | undefined
  isUserLoggedIn: boolean | undefined
  currentUser: IUser | undefined
  sessions: ISession[] | undefined

  hydrate: (data: any) => void
  // fetch actions
  fetchCurrentUser: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (data: IRegistrationData) => Promise<boolean>
  updateUser: (data: Partial<IUser>) => Promise<void>
  reset: () => void
  signOut: () => void

  verifyEmail: () => Promise<void>
  verifyEmailToken: (token: string) => Promise<boolean>

  // Sessions
  fetchAllSessions: () => Promise<void>
  deleteSession: (sessionId: number) => Promise<void>
  deleteAllSessions: () => Promise<void>

  // Integrations
  authenticateGoogle: () => Promise<void>
  revokeGoogle: () => Promise<void>
}

export class UserStore implements IUserStore {
  // observables
  isLoading: boolean = false
  userStatus: TUserStatus | undefined = undefined
  isUserLoggedIn: boolean | undefined = undefined
  currentUser: IUser | undefined = undefined
  sessions: ISession[] | undefined = undefined

  constructor(private store: CoreRootStore) {
    makeObservable(this, {
      // observables
      isLoading: observable,
      userStatus: observable.shallow,
      isUserLoggedIn: observable,
      currentUser: observable.shallow,
      sessions: observable.shallow,

      // action
      fetchCurrentUser: action,
      login: action,
      register: action,
      reset: action,
      signOut: action,

      updateUser: action,
      authenticateGoogle: action,
      revokeGoogle: action,
      verifyEmail: action,
      verifyEmailToken: action,
      fetchAllSessions: action,
      deleteSession: action,
      deleteAllSessions: action
    })
  }

  hydrate = (data: IUser) => {
    if (data) this.currentUser = data
  }

  /**
   * @description Fetches the current user
   * @returns Promise<void>
   */
  fetchCurrentUser = async (): Promise<void> => {
    try {
      if (this.isLoading) return
      if (this.isUserLoggedIn) return
      if (this.store.error.getError(EErrorCodes.UNAUTHORIZED)) return
      if (this.userStatus?.status === EUserStatus.NOT_AUTHENTICATED) return

      this.isLoading = true

      const currentUser = await ipcClient.invoke('user:adminDetails')

      if (currentUser?.data) {
        runInAction(() => {
          this.isUserLoggedIn = true
          this.currentUser = currentUser?.data
          this.userStatus = undefined
          this.isLoading = false
        })
      } else {
        this.store.error.addError(currentUser.error)

        if (currentUser.error.code === EErrorCodes.UNAUTHORIZED) {
          runInAction(() => {
            this.isUserLoggedIn = false
            this.currentUser = undefined
            this.isLoading = false
            this.userStatus = {
              status: EUserStatus.NOT_AUTHENTICATED,
              message: currentUser?.error || ''
            }
          })

          return
        }

        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
        })
      }
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
  login = async (email: string, password: string): Promise<boolean> => {
    try {
      this.isLoading = true
      const currentUser = await ipcClient.invoke('auth:login', email, password)

      if (currentUser?.data) {
        runInAction(() => {
          this.isLoading = false
          this.userStatus = undefined
        })

        this.store.error.removeError(EErrorCodes.UNAUTHORIZED)

        await this.fetchCurrentUser()
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
          toast.error(currentUser?.error.message || 'Login failed')
        })

        throw new Error(currentUser?.error || 'Login failed')
      }

      return currentUser.data || false
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
  register = async (data: IRegistrationData): Promise<boolean> => {
    try {
      this.isLoading = true

      // Handle file conversion for IPC transfer
      let dataToSend = { ...data } as IRegistrationData & {
        avatar?: IAvatarWithBuffer
      }

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

      const response = await ipcClient.invoke('auth:register', dataToSend)

      if (response?.data) {
        runInAction(() => {
          this.isLoading = false
          this.userStatus = undefined
        })

        await this.fetchCurrentUser()
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
          toast.error(response?.error || 'Registration failed')
        })
      }

      return response.data || false
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

  /**
   * @description Update the current user
   * @param data any
   */
  updateUser = async (data: Partial<IUser>): Promise<void> => {
    try {
      this.isLoading = true

      const response = await ipcClient.invoke('user:update', data)

      if (response?.data) {
        runInAction(() => {
          this.currentUser = response.data
          this.isLoading = false
        })
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.isLoading = false
          toast.error(response?.error || 'Update failed')
        })
      }
    } catch (error: any) {
      this.isLoading = false
      this.isUserLoggedIn = false
      toast.error(error?.message || 'Update failed')
    }
  }

  reset = async () => {
    this.isUserLoggedIn = false
    this.currentUser = undefined
    this.isLoading = false
    this.userStatus = undefined
  }

  signOut = async () => {
    const response = await ipcClient.invoke('auth:signOut')
    if (response?.data) this.store.resetOnSignOut()
  }

  fetchAllSessions = async () => {
    try {
      const sessions = await ipcClient.invoke('user:getAllSessions')

      if (sessions?.data) {
        runInAction(() => {
          const sortedSessions = (sessions.data ?? []).sort((a, b) => {
            if (a.isCurrentSession && !b.isCurrentSession) return -1
            if (!a.isCurrentSession && b.isCurrentSession) return 1

            return 0
          })

          this.sessions = sortedSessions
        })
      } else {
        runInAction(() => {
          this.sessions = undefined
        })
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  deleteSession = async (sessionId: number) => {
    try {
      const response = await ipcClient.invoke(
        'user:deleteSession',
        sessionId.toString()
      )

      if (response?.data) {
        toast.success('Session deleted successfully')
        await this.fetchAllSessions()
      } else {
        toast.error(response?.error || 'Failed to delete session')
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  deleteAllSessions = async () => {
    try {
      const response = await ipcClient.invoke('user:deleteAllSessions')

      if (response?.data) {
        toast.success('All sessions deleted successfully')
        await this.fetchAllSessions()
      } else {
        toast.error(response?.error || 'Failed to delete all sessions')
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  verifyEmail = async () => {
    try {
      const response = await ipcClient.invoke('user:verifyEmail')

      if (response?.data) {
      } else {
        runInAction(() => {
          this.userStatus = {
            status: EUserStatus.ERROR,
            message: response?.error || 'Email verification failed'
          }
        })

        toast.error(response?.error || 'Email verification failed')
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  verifyEmailToken = async (token: string) => {
    try {
      const response = await ipcClient.invoke('user:verifyEmailToken', token)

      if (response?.data) {
        runInAction(() => {
          if (this.currentUser) {
            this.currentUser.verified_email = true
          }
        })

        return true
      } else {
        if (response.error.code === EErrorCodes.BAD_REQUEST) {
          runInAction(() => {
            this.userStatus = {
              status: EUserStatus.ERROR,
              message: response?.error.message || 'Invalid or expired token'
            }
          })

          toast.error(response?.error.message || 'Invalid or expired token')
        }

        return false
      }
    } catch (error: any) {
      console.error(error)
      runInAction(() => {
        this.userStatus = {
          status: EUserStatus.ERROR,
          message: error?.message || 'Email verification failed'
        }
      })

      toast.error(error?.message || 'Email verification failed')

      return false
    }
  }

  authenticateGoogle: () => Promise<void> = async () => {
    const onAuthSuccess = (response: any) => {
      if (response?.data) {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.userStatus = undefined
          this.fetchCurrentUser()
        })
      } else {
        runInAction(() => {
          this.isUserLoggedIn = false
          this.currentUser = undefined
          this.userStatus = {
            status: EUserStatus.ERROR,
            message: response?.error || 'Google authentication failed'
          }
        })

        toast.error(response?.error || 'Google authentication failed')
      }

      ipcClient.removeAll('auth:google:callback')
    }

    try {
      const response = await ipcClient.invoke('auth:google')

      if (response?.data) {
        ipcClient.on('auth:google:callback', onAuthSuccess)
      } else {
        runInAction(() => {
          this.currentUser = undefined
          this.isUserLoggedIn = false
          this.userStatus = {
            status: EUserStatus.ERROR,
            message: response?.error || 'Google authentication failed'
          }
        })

        toast.error(response?.error || 'Google authentication failed')
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  revokeGoogle: () => Promise<void> = async () => {
    try {
      const response = await ipcClient.invoke('auth:google:revoke')

      if (response?.data) {
        runInAction(() => {
          this.currentUser = undefined
          this.isUserLoggedIn = false
        })

        toast.success('Google account disconnected successfully')
        await this.fetchCurrentUser()
      } else {
        toast.error(response?.error || 'Failed to disconnect Google account')
      }
    } catch (error: any) {
      console.error(error)
    }
  }
}
