import { IpcHandlers } from '@shared/types/ipc'

// Typed wrapper for IPC communication
export const ipcClient = {
  invoke: async <T extends keyof IpcHandlers>(
    channel: T,
    ...args: Parameters<IpcHandlers[T]>
  ): Promise<Awaited<ReturnType<IpcHandlers[T]>>> => {
    return window.electron.ipcRenderer.invoke(channel, ...args)
  }
}
