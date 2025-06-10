import { app, BrowserWindow, shell } from 'electron'
import path, { join } from 'node:path'
import { now } from './now'
import windowStateKeeper from 'electron-window-state'
import { ILaunchStats } from './lib/stats'
import { Emitter } from 'event-kit'

export class AppWindow {
  private window: Electron.BrowserWindow
  private emitter = new Emitter()

  private _loadTime: number | null = null
  private _rendererReadyTime: number | null = null
  private isDownloadingUpdate: boolean = false

  private minWidth = 960
  private minHeight = 660

  private shouldMaximizeOnShow = false

  constructor() {
    const savedWindowState = windowStateKeeper({
      defaultWidth: this.minWidth,
      defaultHeight: this.minHeight,
      maximize: false
    })

    const windowOptions: Electron.BrowserWindowConstructorOptions = {
      x: savedWindowState.x,
      y: savedWindowState.y,
      width: savedWindowState.width,
      height: savedWindowState.height,
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      show: false,

      autoHideMenuBar: true,

      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        spellcheck: false,
        backgroundThrottling: false
      }
    }

    this.window = new BrowserWindow(windowOptions)
    savedWindowState.manage(this.window)

    let quitting = false

    app.on('before-quit', () => {
      quitting = true
    })

    this.window.on('close', (e) => {
      // On macOS, closing the window doesn't mean the app is quitting. If the
      // app is updating, we will prevent the window from closing only when the
      // app is also quitting.

      if ((!__DARWIN__ || quitting) && this.isDownloadingUpdate) {
        e.preventDefault()

        // Make sure the window is visible, so the user can see why we're
        // preventing the app from quitting. This is important on macOS, where
        // the window could be hidden/closed when the user tries to quit.
        // It could also happen on Windows if the user quits the app from the
        // task bar while it's in the background.
        this.show()
        return
      }

      if (__DARWIN__ && !quitting) {
        e.preventDefault()
        if (this.window.isFullScreen()) {
          this.window.setFullScreen(false)
          this.window.once('leave-full-screen', () => this.window.hide())
        } else {
          this.window.hide()
        }
        return
      }
    })
  }

  load() {
    let startLoad = 0

    this.window.webContents.once('did-start-loading', () => {
      this._rendererReadyTime = null
      this._loadTime = null

      startLoad = now()
    })

    this.window.webContents.once('did-finish-load', () => {
      if (process.env.NODE_ENV === 'development') {
        this.window.webContents.openDevTools()
      }

      this._loadTime = now() - startLoad

      this.maybeEmitDidLoad()
    })

    this.window.webContents.on('did-finish-load', async () => {
      await this.window.webContents.setVisualZoomLevelLimits(1, 1)
    })

    this.window.webContents.on('did-fail-load', () => {
      this.window.webContents.openDevTools()
      this.window.show()
    })

    this.window.webContents.setWindowOpenHandler((details) => {
      void shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (__DEV__ && process.env['ELECTRON_RENDERER_URL']) {
      void this.window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      void this.window.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  /**
   * Emit the `onDidLoad` event if the page has loaded and the renderer has
   * signalled that it's ready.
   */
  private maybeEmitDidLoad() {
    /*if (!this.rendererLoaded) {
      return
    }*/

    this.emitter.emit('did-load', null)
  }

  show() {
    this.window.show()
    if (this.shouldMaximizeOnShow) {
      // Only maximize the window the first time it's shown, not every time.
      // Otherwise, it causes the problem described in desktop/desktop#11590
      this.shouldMaximizeOnShow = false
      this.window.maximize()
    }
  }

  /**
   * Register a function to call when the window is done loading. At that point
   * the page has loaded and the renderer has signalled that it is ready.
   */
  onDidLoad(fn: () => void): Disposable {
    return this.emitter.on('did-load', fn)
  }

  /** Send the app launch timing stats to the renderer. */
  sendLaunchTimingStats(stats: ILaunchStats) {
    //ipcWebContents.send(this.window.webContents, 'launch-timing-stats', stats)
  }

  onClosed(fn: () => void) {
    this.window.on('closed', fn)
  }

  focus() {
    if (this.window.isMinimized()) {
      this.window.restore()
    }

    if (!this.window.isVisible()) {
      this.window.show()
    }

    this.window.focus()
  }

  get isVisible() {
    return this.window.isVisible()
  }

  get isMinimized() {
    return this.window.isMinimized()
  }

  restore() {
    if (this.window.isMinimized()) {
      this.window.restore()
    }
  }

  destroy() {
    this.window.destroy()
  }

  /**
   * Get the time (in milliseconds) spent loading the page.
   *
   * This will be `null` until `onDidLoad` is called.
   */
  get loadTime(): number | null {
    return this._loadTime
  }

  /**
   * Get the time (in milliseconds) elapsed from the renderer being loaded to it
   * signaling it was ready.
   *
   * This will be `null` until `onDidLoad` is called.
   */
  get rendererReadyTime(): number | null {
    return this._rendererReadyTime
  }

  /** Is the page loaded and has the renderer signalled it's ready? */
  private get rendererLoaded(): boolean {
    return !!this.loadTime && !!this.rendererReadyTime
  }

  // Some function to send to frontend (TEMPORARY)
  send(channel: string, ...args: any[]) {
    this.window.webContents.send(channel, ...args)
  }
}
