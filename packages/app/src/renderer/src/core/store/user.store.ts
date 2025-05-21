import {
  IAvatarWithBuffer,
  IRegistrationData,
  ISession,
  IUser
} from '../../../../../../shared/types'
import { EUserStatus, TUserStatus } from '@shared/constants'
import { toast } from 'sonner'
import { EErrorCodes } from '@shared/helpers'
import { ipcClient } from '@renderer/utils/ipcClient'
import { create } from 'zustand'
import { useErrorStore } from './error.store'

export interface IUserStore {
  isLoading: boolean
  userStatus: TUserStatus | undefined
  isUserLoggedIn: boolean | undefined
  currentUser: IUser | undefined
  sessions: ISession[] | undefined

  fetchCurrentUser: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (data: IRegistrationData) => Promise<boolean>
  updateUser: (data: Partial<IUser>) => Promise<void>
  reset: () => void
  signOut: () => void

  resetOnSignOut: () => void

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

export const useUserStore = create<IUserStore>((set, get) => ({
  isLoading: false,
  userStatus: undefined,
  isUserLoggedIn: undefined,
  currentUser: undefined,
  sessions: undefined,

  /**
   * @description Fetches the current user
   * @returns Promise<void>
   */
  fetchCurrentUser: async (): Promise<void> => {
    try {
      const { isLoading, isUserLoggedIn, userStatus } = get()

      if (isLoading) return
      if (isUserLoggedIn) return
      if (useErrorStore.getState().getError(EErrorCodes.UNAUTHORIZED)) return
      if (userStatus?.status === EUserStatus.NOT_AUTHENTICATED) return

      set({ isLoading: true })

      const currentUser = await ipcClient.invoke('user:adminDetails')

      if (currentUser?.data) {
        set({
          isLoading: false,
          currentUser: currentUser.data,
          userStatus: undefined,
          isUserLoggedIn: true
        })
      } else {
        useErrorStore.getState().addError(currentUser.error)

        if (currentUser.error.code === EErrorCodes.UNAUTHORIZED) {
          set({
            isUserLoggedIn: false,
            currentUser: undefined,
            isLoading: false,
            userStatus: {
              status: EUserStatus.NOT_AUTHENTICATED,
              message: currentUser?.error || ''
            }
          })
          return
        }

        set({
          isUserLoggedIn: false,
          currentUser: undefined,
          isLoading: false
        })
      }
    } catch (error: any) {
      set({
        isLoading: false,
        isUserLoggedIn: false
      })

      if (error.status === 403)
        set({
          userStatus: {
            status: EUserStatus.AUTHENTICATION_NOT_DONE,
            message: error?.message || ''
          }
        })
      else
        set({
          userStatus: {
            status: EUserStatus.ERROR,
            message: error?.message || ''
          }
        })

      throw error
    }
  },

  /**
   * @description Login in the current user
   * @param {string} email
   * @param {string} password
   * @returns Promise<IUser>
   */
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      set({ isLoading: true })

      const currentUser = await ipcClient.invoke('auth:login', email, password)

      if (currentUser?.data) {
        set({
          isLoading: false,
          userStatus: undefined
        })

        useErrorStore.getState().removeError(EErrorCodes.UNAUTHORIZED)

        get().fetchCurrentUser()
      } else {
        set({
          isUserLoggedIn: false,
          currentUser: undefined,
          isLoading: false
        })

        toast.error(currentUser?.error.message || 'Login failed')

        throw new Error(currentUser?.error || 'Login failed')
      }

      return currentUser.data || false
    } catch (error: any) {
      set({
        isLoading: false,
        isUserLoggedIn: false
      })

      if (error.status === 403)
        set({
          userStatus: {
            status: EUserStatus.AUTHENTICATION_NOT_DONE,
            message: error?.message || ''
          }
        })
      else
        set({
          userStatus: {
            status: EUserStatus.ERROR,
            message: error?.message || ''
          }
        })

      throw error
    }
  },

  /**
   * @description Register the current user
   * @param data any
   * @returns Promise<IUser>
   */
  register: async (data: IRegistrationData): Promise<boolean> => {
    try {
      set({ isLoading: true })

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
        set({
          isLoading: false,
          userStatus: undefined
        })

        get().fetchCurrentUser()
      } else {
        set({
          isUserLoggedIn: false,
          currentUser: undefined,
          isLoading: false
        })

        toast.error(response?.error || 'Registration failed')
      }

      return response.data || false
    } catch (error: any) {
      set({
        isLoading: false,
        isUserLoggedIn: false
      })

      if (error.status === 403)
        set({
          userStatus: {
            status: EUserStatus.AUTHENTICATION_NOT_DONE,
            message: error?.message || ''
          }
        })
      else
        set({
          userStatus: {
            status: EUserStatus.ERROR,
            message: error?.message || ''
          }
        })

      toast.error(error?.message || 'Registration failed')
      throw error
    }
  },

  /**
   * @description Update the current user
   * @param data any
   */
  updateUser: async (data: Partial<IUser>): Promise<void> => {
    try {
      set({ isLoading: true })

      const response = await ipcClient.invoke('user:update', data)

      if (response?.data) {
        set({
          isLoading: false,
          currentUser: response.data
        })
      } else {
        set({
          isUserLoggedIn: false,
          currentUser: undefined,
          isLoading: false
        })

        toast.error(response?.error || 'Update failed')
      }
    } catch (error: any) {
      set({
        isLoading: false,
        isUserLoggedIn: false
      })
      toast.error(error?.message || 'Update failed')
    }
  },

  reset: async () => {
    set({
      isUserLoggedIn: false,
      currentUser: undefined,
      isLoading: false,
      userStatus: undefined
    })
  },

  signOut: async () => {
    const response = await ipcClient.invoke('auth:signOut')
    if (response?.data) get().resetOnSignOut()
  },

  resetOnSignOut: () => {
    localStorage.setItem('theme', 'dark'),
      (window.location.href = '/'),
      set({
        isUserLoggedIn: false,
        currentUser: undefined,
        isLoading: false,
        userStatus: undefined
      })
  },

  fetchAllSessions: async () => {
    try {
      const sessions = await ipcClient.invoke('user:getAllSessions')

      if (sessions?.data) {
        const sortedSessions = (sessions.data ?? []).sort((a, b) => {
          if (a.isCurrentSession && !b.isCurrentSession) return -1
          if (!a.isCurrentSession && b.isCurrentSession) return 1

          return 0
        })

        set({
          sessions: sortedSessions
        })
      } else {
        set({
          sessions: undefined
        })
      }
    } catch (error: any) {
      console.error(error)
    }
  },

  deleteSession: async (sessionId: number) => {
    try {
      const response = await ipcClient.invoke(
        'user:deleteSession',
        sessionId.toString()
      )

      if (response?.data) {
        toast.success('Session deleted successfully')
        get().fetchAllSessions()
      } else {
        toast.error(response?.error || 'Failed to delete session')
      }
    } catch (error: any) {
      console.error(error)
    }
  },

  deleteAllSessions: async () => {
    try {
      const response = await ipcClient.invoke('user:deleteAllSessions')

      if (response?.data) {
        toast.success('All sessions deleted successfully')

        get().fetchAllSessions()
      } else {
        toast.error(response?.error || 'Failed to delete all sessions')
      }
    } catch (error: any) {
      console.error(error)
    }
  },

  verifyEmail: async () => {
    try {
      const response = await ipcClient.invoke('user:verifyEmail')

      if (response?.data) {
      } else {
        set({
          userStatus: {
            status: EUserStatus.ERROR,
            message: response?.error || 'Email verification failed'
          }
        })

        toast.error(response?.error || 'Email verification failed')
      }
    } catch (error: any) {
      console.error(error)
    }
  },

  verifyEmailToken: async (token: string) => {
    try {
      const response = await ipcClient.invoke('user:verifyEmailToken', token)

      if (response?.data) {
        const prevUser = get().currentUser

        if (prevUser) {
          set({
            currentUser: {
              ...prevUser,
              verified_email: true
            }
          })
        }

        return true
      } else {
        if (response.error.code === EErrorCodes.BAD_REQUEST) {
          set({
            userStatus: {
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
      set({
        userStatus: {
          status: EUserStatus.ERROR,
          message: error?.message || 'Email verification failed'
        }
      })

      toast.error(error?.message || 'Email verification failed')

      return false
    }
  },

  authenticateGoogle: async () => {
    const onAuthSuccess = (response: any) => {
      if (response?.data) {
        set({
          isUserLoggedIn: false,
          userStatus: undefined
        })

        get().fetchCurrentUser()
      } else {
        set({
          isUserLoggedIn: false,
          currentUser: undefined,
          userStatus: {
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
        set({
          isUserLoggedIn: false,
          currentUser: undefined,
          userStatus: {
            status: EUserStatus.ERROR,
            message: response?.error || 'Google authentication failed'
          }
        })

        toast.error(response?.error || 'Google authentication failed')
      }
    } catch (error: any) {
      console.error(error)
    }
  },

  revokeGoogle: async () => {
    try {
      const response = await ipcClient.invoke('auth:google:revoke')

      if (response?.data) {
        set({
          currentUser: undefined,
          isUserLoggedIn: false
        })

        toast.success('Google account disconnected successfully')

        get().fetchCurrentUser()
      } else {
        toast.error(response?.error || 'Failed to disconnect Google account')
      }
    } catch (error: any) {
      console.error(error)
    }
  }
}))
