import { app, shell, BrowserWindow } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { ConfStorage } from './store'
import { loadNoteServices } from './services/note.service'
import handleDeepLink from './deep-link'
import { loadSystemSockets } from './sockets/system.socket'
import { loadDashboardServices } from './services/dashboard.service'
import { runMigrations } from './database/data-source'
import { registerMsnIPC } from './services/news/msn.ipc'
import { registerSystemIPC } from './services/system'
import { registerAuthIPC, registerUserIPC } from './services/user'
import { registerExtensionIPC } from './services/extensions'
import { registerIntegrations } from './services/integrations'
import { registerApplicationIPC } from './services/application/application.ipc'

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      const deepLink = argv.find((arg) => arg.startsWith('managerapp://'))
      if (deepLink) {
        handleDeepLink(deepLink)
      }
    }
  })

  app.whenReady().then(async () => {
    try {
      electronApp.setAppUserModelId('com.electron')

      // Register protocol for deep linking (Windows & Linux)
      if (process.defaultApp) {
        if (process.argv.length >= 2) {
          app.setAsDefaultProtocolClient('managerapp', process.execPath, [
            path.resolve(process.argv[1])
          ])
        }
      } else {
        app.setAsDefaultProtocolClient('managerapp')
      }

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      await ConfStorage.validateExistence()
      await runMigrations().catch((error) => {
        console.error('Error running migrations:', error)
      })

      createWindow()

      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })

      registerIpc()
    } catch (error) {
      console.error(error)
    }
  })

  // Handle Deep Links (macOS)
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleDeepLink(url)
  })

  // Handle Deep Links (Windows/Linux)
  if (process.platform !== 'darwin') {
    const deepLink = process.argv.find((arg) => arg.startsWith('managerapp://'))
    if (deepLink) {
      handleDeepLink(deepLink)
    }
  }
}
let stopSystemSockets: (() => void) | null = null // <-- ADD THIS

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    // STOP the previous interval if one exists
    if (stopSystemSockets) {
      stopSystemSockets()
    }

    // START a new system socket
    stopSystemSockets = loadSystemSockets(mainWindow)
  })

  mainWindow.on('closed', () => {
    if (stopSystemSockets) {
      stopSystemSockets()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * Register all IPC handlers
 * @returns {void}
 */
function registerIpc() {
  registerAuthIPC()
  registerUserIPC()

  registerExtensionIPC()

  registerIntegrations()
  loadNoteServices()
  loadDashboardServices()

  registerApplicationIPC()
  registerSystemIPC()
  registerMsnIPC()
}
