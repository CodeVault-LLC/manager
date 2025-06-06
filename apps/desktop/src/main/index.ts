import path, { join } from 'path'

import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { app, shell, BrowserWindow, session } from 'electron'

import icon from '../../resources/icons/icon.ico?asset'

import { runMigrations } from './database/data-source'
import handleDeepLink from './deep-link'
import { startGrpc } from './grpc/bootstrap'
import { manager } from './grpc/service-manager'
import logger from './logger'
import { registerApplicationIPC } from './services/application/application.ipc'
import { loadDashboardServices } from './services/dashboard.service'
import { registerDeveloperIPC } from './services/developer/developer.ipc'
import { registerExtensionIPC } from './services/extensions'
import { registerIntegrations } from './services/integrations'
import { registerMsnIPC } from './services/news/msn.ipc'
import { registerSystemIPC } from './services/system'
import { registerAuthIPC, registerUserIPC } from './services/user'
import { loadSystemSockets } from './sockets/system.socket'
import { ConfStorage } from './store'
import { registerNotesIPC } from './services/notes/notes.ipc'
import { homedir } from 'os'

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
        void handleDeepLink(deepLink)
      }
    }
  })

  const extensionsOnLoad: string[] = []

  if (is.dev) {
    if (process.platform === 'darwin') {
      // macOS specific extensions
      extensionsOnLoad.push(
        path.join(
          homedir(),
          '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/6.1.2_0'
        )
      )
    }
    if (process.platform === 'linux') {
      // Linux specific extensions
      extensionsOnLoad.push(join(__dirname, '../extensions/react-devtools'))
    }
    if (process.platform === 'win32') {
      // Windows specific extensions
      extensionsOnLoad.push(join(__dirname, '../extensions/react-devtools'))
    }
  }

  void app.whenReady().then(async () => {
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

      // Register extensions listed
      for (const extensionPath of extensionsOnLoad) {
        try {
          await session.defaultSession
            .loadExtension(extensionPath, {
              allowFileAccess: true
            })
            .then(() => {
              logger.info(`Extension loaded successfully from ${extensionPath}`)
            })
            .catch((error) => {
              logger.error(
                `Failed to load extension from ${extensionPath}:`,
                error
              )
            })
        } catch (error) {
          logger.error(`Failed to load extension at ${extensionPath}:`, error)
        }
      }

      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })

      await ConfStorage.validateExistence()
      await runMigrations().catch((error) => {
        logger.error('Error running migrations:', error)
      })

      createWindow()

      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })

      registerIpc()

      await startGrpc()
      logger.info('gRPC services initialized successfully')
    } catch (error) {
      logger.error('Error during app initialization:', error)
    }
  })

  app.on('before-quit', async () => {
    logger.info('Application is quitting, stopping all services...')

    // Stop all services gracefully
    await manager.stopAllServices()
  })

  // Handle Deep Links (macOS)
  app.on('open-url', (event, url) => {
    event.preventDefault()
    void handleDeepLink(url)
  })

  // Handle Deep Links (Windows/Linux)
  if (process.platform !== 'darwin') {
    const deepLink = process.argv.find((arg) => arg.startsWith('managerapp://'))
    if (deepLink) {
      void handleDeepLink(deepLink)
    }
  }
}
let stopSystemSockets: (() => void) | null = null

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
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
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * Register all IPC handlers
 * @returns {void}
 */
function registerIpc() {
  registerAuthIPC()
  registerUserIPC()

  void registerExtensionIPC()

  registerIntegrations()
  void registerNotesIPC()
  loadDashboardServices()

  registerDeveloperIPC()

  registerApplicationIPC()
  registerSystemIPC()
  void registerMsnIPC()
}
