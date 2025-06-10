import { IpcRendererListener } from '@electron-toolkit/preload'
import { EErrorCodes, IpcEmittedEvents, IpcHandlers } from '@manager/common/src'
import { useErrorStore } from '@renderer/core/store/error.store'

export const ipcClient = {
  // Wrapper for invoking IPC methods
  invoke: async <T extends keyof IpcHandlers>(
    channel: T,
    ...args: Parameters<IpcHandlers[T]>
  ): Promise<Awaited<ReturnType<IpcHandlers[T]>>> => {
    /*if (useErrorStore.getState().getError(EErrorCodes.NETWORK_ERROR)) {
      return Promise.reject(new Error('Network error')) as Promise<
        Awaited<ReturnType<IpcHandlers[T]>>
      >
    }*/

    try {
      return await window.electron.invoke(channel, ...args)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`IPC Invoke Error [${channel}]:`, error)
      throw error
    }
  },

  // Wrapper for listening to emitted events
  on: <T extends keyof IpcEmittedEvents>(
    channel: T,
    listener: IpcRendererListener
  ): void => {
    window.electron.on(channel, listener)
  },

  // Remove a specific listener
  off: <T extends keyof IpcEmittedEvents>(
    channel: T,
    listener: IpcRendererListener
  ): void => {
    window.electron.removeListener(channel, listener)
  },

  // Remove all listeners for a given event
  removeAll: <T extends keyof IpcEmittedEvents>(channel: T): void => {
    window.electron.removeAllListeners(channel)
  },

  // Get all listeners for a given event
  listeners: <T extends keyof IpcEmittedEvents>(
    _: T
  ): Array<(...args: any[]) => any> => {
    return [] as Array<(...args: any[]) => any>
  }
}
