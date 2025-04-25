import { BrowserWindow } from 'electron'
import { getDiskInformation } from '../utils/system.helper'
import { ISystemStatistics } from '@shared/types/system'

export const loadSystemSockets = (mainWindow: BrowserWindow) => {
  setInterval(async () => {
    const cpuLoad = process.getCPUUsage().percentCPUUsage

    const memory = process.memoryUsage()
    const memoryLoad = memory.heapUsed / memory.heapTotal

    const disks = await getDiskInformation()
    const diskLoad = disks.map((disk) => ({
      name: disk.caption,
      load: (disk.size - disk.freeSpace) / disk.size
    }))

    const statistics: ISystemStatistics = {
      cpu: cpuLoad,
      memory: memoryLoad,
      disk: diskLoad,
      uptime: process.uptime(),
      pid: process.pid
    }

    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('system:statistics', statistics)
    }
  }, 1000)
}
