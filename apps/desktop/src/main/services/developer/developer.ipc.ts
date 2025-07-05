import { AppWindow } from '../../app-window'
import { registerImageIPC } from './images'
import { registerRmapIPC } from './rmap/rmap.ipc'

export const registerDeveloperIPC = (mainWindow: AppWindow) => {
  void registerImageIPC()
  void registerRmapIPC(mainWindow)
}
