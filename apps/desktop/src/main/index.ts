import './lib/logging/install'

import { optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'

import { runMigrations } from './database/data-source'
import { startGrpc } from './grpc/bootstrap'
import { manager } from './grpc/service-manager'
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
import {
  enableSourceMaps,
  withSourceMappedStack
} from './lib/source-map-support'
import { AppWindow } from './app-window'
import { now } from './now'
import { showUncaughtException } from './show-uncaught-exception'
import { reportError } from './exception-reporting'

import './services/network'
import { setupAutoUpdater } from './lib/updater'

app.setAppLogsPath()
enableSourceMaps()

let mainWindow: AppWindow | null = null

const launchTime = now() // Store the launch time for performance tracking

let preventQuit = false
let readyTime: number | null = null

type OnDidLoadFn = (window: AppWindow) => void

let onDidLoadFns: Array<OnDidLoadFn> | null = []

function handleUncaughtException(error: Error) {
  preventQuit = true

  // If we haven't got a window we'll assume it's because
  // we've just launched and haven't created it yet.
  // It could also be because we're encountering an unhandled
  // exception on shutdown but that's less likely and since
  // this only affects the presentation of the crash dialog
  // it's a safe assumption to make.
  if (mainWindow) {
    mainWindow.destroy()
    mainWindow = null
  }

  showUncaughtException(error)
}

/**
 * Calculates the number of seconds the app has been running
 */
function getUptimeInSeconds() {
  return (now() - launchTime) / 1000
}

function getExtraErrorContext(): Record<string, string> {
  return {
    uptime: getUptimeInSeconds().toFixed(3),
    time: new Date().toString()
  }
}

/** Extra argument for the protocol launcher on Windows */
//const protocolLauncherArg = '--protocol-launcher'

// On Windows, in order to get notifications properly working for dev builds,
// we'll want to set the right App User Model ID from production builds.
if (__WIN32__ && __DEV__) {
  app.setAppUserModelId('com.electron.managerapp')
}

app.on('window-all-closed', () => {
  // If we don't subscribe to this event and all windows are closed, the default
  // behavior is to quit the app. We don't want that though, we control that
  // behavior through the mainWindow onClose event such that on macOS we only
  // hide the main window when a user attempts to close it.
  //
  // If we don't subscribe to this and change the default behavior we break
  // the crash process window which is shown after the main window is closed.
})

process.on('uncaughtException', (error: Error) => {
  error = withSourceMappedStack(error)
  void reportError(error, getExtraErrorContext())
  handleUncaughtException(error)
})

function handleAppURL(url: string): void {
  void log.info('Processing protocol url:', url.toString())
}

let isDuplicateInstance = false

const gotSingleInstanceLock = app.requestSingleInstanceLock()
isDuplicateInstance = !gotSingleInstanceLock

app.on('second-instance', (_, __, ___) => {
  if (mainWindow) {
    if (mainWindow.isMinimized) {
      mainWindow.restore()
    }

    if (!mainWindow.isVisible) {
      mainWindow.show()
    }

    mainWindow.focus()
  }

  // handleCommandLineArguments(args)
  /* 
  const deepLink = argv.find((arg) => arg.startsWith('managerapp://'))
      if (deepLink) {
        void handleDeepLink(deepLink)
      }
        */
})

if (isDuplicateInstance) {
  app.quit()
}

app.on('will-finish-launching', () => {
  // macOS only
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleAppURL(url)
  })
})

app.on('ready', async () => {
  try {
    if (isDuplicateInstance) {
      return
    }

    readyTime = now() - launchTime

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    await ConfStorage.init()
    await runMigrations().catch((error) => {
      log.error('Error running migrations:', error)
    })

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    registerIpc()

    await startGrpc()
    log.info('gRPC services initialized successfully')
  } catch (error) {
    log.error('Error during app initialization:', error)
  }
})

app.on('before-quit', async () => {
  log.info('Application is quitting, stopping all services...')

  // Stop all services gracefully
  await manager.stopAllServices()
})

let stopSystemSockets: (() => void) | null = null

function createWindow(): void {
  const window = new AppWindow()
  window.load()

  setupAutoUpdater(window.getWindow)

  window.onClosed(() => {
    mainWindow = null

    if (stopSystemSockets) {
      stopSystemSockets()
    }

    if (!__DARWIN__ && !preventQuit) {
      app.quit()
    }
  })

  window.onDidLoad(() => {
    window.show()

    window.sendLaunchTimingStats({
      mainReadyTime: readyTime!,
      loadTime: window.loadTime!,
      rendererReadyTime: window.rendererReadyTime!
    })

    const fns = onDidLoadFns!
    onDidLoadFns = null
    for (const fn of fns) {
      fn(window)
    }

    if (stopSystemSockets) {
      stopSystemSockets()
    }

    // START a new system socket
    stopSystemSockets = loadSystemSockets(window)
  })

  mainWindow = window
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
