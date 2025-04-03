import { ipcMain } from 'electron'
import { getDiskInformation } from '../utils/system.helper'
import { ISystemStatistics } from '@shared/types/system'

export const loadSystemSockets = () => {
  setInterval(async () => {
    const cpuLoad = process.getCPUUsage().percentCPUUsage

    const memory = process.memoryUsage()
    const memoryLoad = memory.heapUsed / memory.heapTotal

    const disks = await getDiskInformation()
    const diskLoad = disks.map((disk) => ({
      name: disk.caption,
      load: (disk.size - disk.freeSpace) / disk.size
    }))

    ipcMain.emit('system:statistics', {
      cpu: cpuLoad,
      memory: memoryLoad,
      disk: diskLoad,
      uptime: process.uptime(),
      pid: process.pid
    } as ISystemStatistics)
  }, 1000)
}
