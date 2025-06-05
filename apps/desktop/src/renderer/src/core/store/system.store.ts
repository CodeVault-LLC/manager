import { ipcClient } from '@renderer/utils/ipcClient'
import { toast } from 'sonner'
import { create } from 'zustand'

import {
  IBrowser,
  IExtension,
  ISystem,
  ISystemHardware,
  ISystemStatistics
} from '@manager/common/src'

import { getValue } from '../../hooks/use-i18n'

export interface ISystemStore {
  systemInactivity: boolean
  hardware: ISystemHardware | null
  system: ISystem | null
  extensions: IExtension[]
  browsers: IBrowser[]
  storage: any
  loading: boolean

  systemStatistics: ISystemStatistics

  getBrowserInitial(): void
  setBrowsers(browsers: IBrowser[]): void

  doBrowserRefresh(): void

  getExtensions(marketplace?: boolean): void

  subscribeToSystemStatistics(): void
  setSystemStatistics(data: ISystemStatistics): void
  unsubscribeFromSystemStatistics(): void

  subscribeToSystemInactivity(): void
  unsubscribeFromSystemInactivity(): void

  getSystemHardware(): void
  getSystem(): void
  getStorageOverview(): void
}

export const useSystemStore = create<ISystemStore>((set, get) => ({
  systemInactivity: false,
  extensions: [],
  hardware: null,
  browsers: [],
  system: null,
  storage: null,
  loading: false,

  systemStatistics: {
    cpu: { current: 0, average: 0 },
    memory: { current: 0, average: 0 },
    disk: { current: 0, average: 0 },
    network: { received: 0, transmitted: 0 },
    uptime: 0,
    pid: 0
  },

  getBrowserInitial: (): void => {
    ipcClient.invoke('browser:initial').then((response) => {
      if (response.data) {
        get().setBrowsers(response.data)
      } else {
        // eslint-disable-next-line no-console
        console.error('getting initial browser data error', response.error)
      }
    })
  },

  getSystemHardware: (): void => {
    ipcClient.invoke('system:getHardware').then((response) => {
      if (response.data) {
        set({ hardware: response.data })
      } else {
        // eslint-disable-next-line no-console
        console.error('getting initial system data error', response.error)
      }
    })
  },

  getSystem: (): void => {
    ipcClient.invoke('system:getSystemInfo').then((response) => {
      if (response.data) {
        set({ system: response.data })
      } else {
        // eslint-disable-next-line no-console
        console.error('getting initial system data error', response.error)
        toast.error(getValue('error.systemRetrievalError'))
      }
    })
  },

  doBrowserRefresh: (): void => {
    ipcClient.invoke('browser:refresh').then((response) => {
      if (response.data) {
        get().setBrowsers(response.data)
      } else {
        // eslint-disable-next-line no-console
        console.error('getting initial browser data error', response.error)
      }
    })
  },

  getExtensions(marketplace = false): void {
    ipcClient.invoke('extensions:getAll', marketplace).then((response) => {
      if (response.data) {
        set({ extensions: response.data })
      } else {
        // eslint-disable-next-line no-console
        console.error('getting initial extension data error', response.error)
      }
    })
  },

  setBrowsers: (browsers: IBrowser[]) => {
    set({ browsers })
  },

  getStorageOverview: (): void => {
    set({ loading: true })
    ipcClient
      .invoke('system:storageOverview')
      .then((response) => {
        if (response.data) {
          set({ storage: response.data })
        } else {
          // eslint-disable-next-line no-console
          console.error('getting initial storage data error', response.error)
        }
      })
      .finally(() => {
        set({ loading: false })
      })
  },

  setSystemStatistics: (data: ISystemStatistics) => {
    set((state) => ({
      systemStatistics: {
        ...state.systemStatistics,
        ...data
      }
    }))
  },

  subscribeToSystemStatistics: () => {
    const listeners = ipcClient.listeners('system:statistics')
    if (listeners.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('Listener already registered for system:statistics')
      return
    }

    ipcClient.on('system:statistics', (_, data) => {
      get().setSystemStatistics(data)
    })
  },

  unsubscribeFromSystemStatistics: () => {
    ipcClient.removeAll('system:statistics')
  },

  subscribeToSystemInactivity: () => {
    const listeners = ipcClient.listeners('system:inactivity')
    if (listeners.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('Listener already registered for system:inactivity')
      return
    }

    ipcClient.on('system:inactivity', (_, data) => {
      set({ systemInactivity: data.inactive })
    })
  },

  unsubscribeFromSystemInactivity: () => {
    ipcClient.removeAll('system:inactivity')
  }
}))
