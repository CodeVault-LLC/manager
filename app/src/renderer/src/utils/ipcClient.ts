import { IpcHandlers } from '@shared/types/ipc'
import { store } from './store-context'
import { EErrorCodes } from '@shared/helpers'

// Typed wrapper for IPC communication
export const ipcClient = {
  invoke: async <T extends keyof IpcHandlers>(
    channel: T,
    ...args: Parameters<IpcHandlers[T]>
  ): Promise<Awaited<ReturnType<IpcHandlers[T]>>> => {
    if (store.error.getError(EErrorCodes.NETWORK_ERROR)) {
      return Promise.reject(new Error('Network error')) as Promise<Awaited<ReturnType<IpcHandlers[T]>>>
    }

    return window.electron.ipcRenderer.invoke(channel, ...args)
  }
}
