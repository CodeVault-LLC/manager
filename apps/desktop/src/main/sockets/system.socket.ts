import os from 'node:os'

import { ISystemStatistics } from '@shared/types/system'
import { BrowserWindow, powerMonitor } from 'electron'
import si from 'systeminformation'

import { getNetworkUsage } from '../utils/system.helper'



import { getAppState, setAppState } from '@main/states/app-state'

export const loadSystemSockets = (mainWindow: BrowserWindow) => {
  const interval = setInterval(async () => {
    if (getAppState() !== 'active') {
      return
    }

    const load = await si.currentLoad()

    const memoryData = await si.mem()

    const usedMem = memoryData.active + memoryData.buffers + memoryData.cached
    const memoryUsage = (usedMem / memoryData.total) * 100

    const disks = await si.fsSize() // use systeminformation here

    let totalDisk = 0
    let usedDisk = 0
    for (const disk of disks) {
      totalDisk += disk.size
      usedDisk += disk.used
    }
    const diskUsage = (usedDisk / totalDisk) * 100

    const uptimeSeconds = os.uptime()

    const networkStats = await getNetworkUsage()

    const statistics: ISystemStatistics = {
      cpu: {
        average: load.avgLoad,
        current: load.currentLoad
      },
      memory: {
        current: memoryUsage,
        average: 0
      },
      disk: {
        current: diskUsage,
        average: 0
      },
      network: networkStats,
      uptime: uptimeSeconds,
      pid: process.pid
    }

    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('system:statistics', statistics)
    }
  }, 1000)

  const idleTimer = setInterval(() => {
    const idleSeconds = powerMonitor.getSystemIdleTime()

    const idleTime = 5 * 60

    if (idleSeconds > idleTime && getAppState() !== 'inactive') {
      setAppState('inactive')
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('system:inactivity', {
          inactive: true,
          pid: process.pid
        })
      }
    } else if (idleSeconds <= 5 && getAppState() !== 'active') {
      setAppState('active')
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('system:inactivity', {
          inactive: false,
          pid: process.pid
        })
      }
    }
  }, 10000)

  return () => {
    clearInterval(interval)
    clearInterval(idleTimer)
  }
}
