/** Is the app running in dev mode? */
declare const __DEV__: boolean

/** Is the app using dev secrets? */
declare const __DEV_SECRETS__: boolean

/** Is the app being built to run on Darwin? */
declare const __DARWIN__: boolean

/** Is the app being built to run on Win32? */
declare const __WIN32__: boolean

/** Is the app being built to run on Linux? */
declare const __LINUX__: boolean

/**
 * The product name of the app, this is intended to be a compile-time
 * replacement for app.getName
 * (https://www.electronjs.org/docs/latest/api/app#appgetname)
 */
declare const __APP_NAME__: string

/**
 * The current version of the app, this is intended to be a compile-time
 * replacement for app.getVersion
 * (https://www.electronjs.org/docs/latest/api/app#appgetname)
 */
declare const __APP_VERSION__: string

/**
 * The commit id of the repository HEAD at build time.
 * Represented as a 40 character SHA-1 hexadecimal digest string.
 */
declare const __SHA__: string

/** The channel for which the release was created. */
declare const __RELEASE_CHANNEL__:
  | 'production'
  | 'beta'
  | 'test'
  | 'development'

/** The repository owner for the app, used for update URLs */
declare const __REPO_OWNER__: string

/** The repository name for the app, used for update URLs */
declare const __REPO_NAME__: string

interface IDesktopLogger {
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
  debug: (message: string, ...args: any[]) => void
}

declare const log: IDesktopLogger
