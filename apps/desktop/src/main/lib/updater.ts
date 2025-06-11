import { BrowserWindow, ipcMain } from 'electron'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

autoUpdater.logger = log
autoUpdater.autoDownload = false

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  // Check for updates immediately when app is ready
  if (!__DEV__) {
    log.info('Setting up auto-updater...')

    setTimeout(() => {
      void checkForUpdates()
    }, 3000)

    // Check for updates every hour
    setInterval(
      () => {
        void checkForUpdates()
      },
      60 * 60 * 1000
    )
  }

  // for testing
  void checkForUpdates()

  // Listen for update events
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...')
    mainWindow.webContents.send('application:updateStatus', {
      status: 'checking-for-update',
      message: 'Checking for updates...'
    })
  })

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info)
    mainWindow.webContents.send('application:updateStatus', {
      status: 'update-available',
      version: info.version,
      message: `Update available: ${info.version}`
    })
  })

  autoUpdater.on('update-not-available', () => {
    log.info('No updates available')
    mainWindow.webContents.send('application:updateStatus', {
      status: 'update-not-available',
      message: 'No updates available'
    })
  })

  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err)
    mainWindow.webContents.send('application:updateStatus', {
      status: 'error',
      message: `Error: ${err.message}`
    })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = progressObj.percent || 0
    mainWindow.webContents.send('application:updateDownloadProgress', percent)
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded')
    mainWindow.webContents.send('application:updateStatus', {
      status: 'update-downloaded',
      version: info.version,
      message: 'Update downloaded. It will be installed on restart.'
    })
  })

  // Register IPC handlers
  ipcMain.handle('application:checkForUpdates', async () => {
    return checkForUpdates()
  })

  ipcMain.handle(
    'application:updateAction',
    async (_event, shouldInstall: boolean) => {
      if (shouldInstall) {
        log.info('Installing update now...')
        autoUpdater.quitAndInstall(false, true)
        return { success: true }
      } else {
        log.info('Download update requested')
        try {
          await autoUpdater.downloadUpdate()
          return { success: true }
        } catch (error) {
          log.error('Failed to download update:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      }
    }
  )
}

async function checkForUpdates() {
  try {
    return await autoUpdater.checkForUpdates()
  } catch (error) {
    log.error('Failed to check for updates:', error)
    return null
  }
}
