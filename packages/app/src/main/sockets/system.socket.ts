import { BrowserWindow } from 'electron'
import { ISystemStatistics } from '@shared/types/system'
import { getNetworkUsage } from '../utils/system.helper'

import si from 'systeminformation'
import os from 'node:os'

export const loadSystemSockets = (mainWindow: BrowserWindow) => {
  const interval = setInterval(async () => {
    const load = await si.currentLoad()

    const memoryData = await si.mem()

    const usedMem = memoryData.active + memoryData.buffers + memoryData.cached
    const memoryUsage = (usedMem / memoryData.total) * 100

    const disks = await si.fsSize() // use systeminformation here

    let totalDisk = 0
    let usedDisk = 0
    for (let disk of disks) {
      totalDisk += disk.size
      usedDisk += disk.used
    }
    const diskUsage = (usedDisk / totalDisk) * 100

    const uptimeSeconds = os.uptime()

    const networkStats = await getNetworkUsage()

    const statistics: ISystemStatistics = {
      cpu: load.currentLoad,
      memory: memoryUsage,
      disk: diskUsage,
      network: networkStats,
      uptime: uptimeSeconds,
      pid: process.pid
    }

    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('system:statistics', statistics)
    }
  }, 1000)

  return () => {
    console.log('Stopping system sockets...')
    clearInterval(interval)
  }
}
