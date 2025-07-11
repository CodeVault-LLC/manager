import * as Path from 'path'
import * as Fs from 'fs'
import sourceMapSupport from 'source-map-support'
import { fileURLToPath } from 'url'

/**
 * This array tells the source map logic which files that we can expect to
 * be able to resolve a source map for and they should reflect the chunks
 * entry names from our webpack config.
 *
 * Note that we explicitly don't enable source maps for the crash process
 * since it's possible that the error which caused us to spawn the crash
 * process was related to source maps.
 */
const knownFilesWithSourceMap = ['renderer.js', 'main.js']

function retrieveSourceMap(source: string) {
  // This is a happy path in case we know for certain that we won't be
  // able to resolve a source map for the given location.
  if (!knownFilesWithSourceMap.some((file) => source.endsWith(file))) {
    return null
  }

  // We get a file uri when we're inside a renderer, convert to a path
  if (source.startsWith('file://')) {
    source = fileURLToPath(source)
  }

  // We store our source maps right next to the bundle
  const path = `${source}.map`

  if (__DEV__ && path.startsWith('http://')) {
    try {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', path, false)
      xhr.send(null)
      if (xhr.readyState === 4 && xhr.status === 200) {
        return { url: Path.basename(path), map: xhr.responseText }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null
    }
    return null
  }

  // We don't have an option here, see
  //  https://github.com/v8/v8/wiki/Stack-Trace-API#customizing-stack-traces
  // This happens on-demand when someone accesses the stack
  // property on an error object and has to be synchronous :/
  if (!Fs.existsSync(path)) {
    return null
  }

  try {
    const map = Fs.readFileSync(path, 'utf8')
    return { url: Path.basename(path), map }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null
  }
}

/** A map from errors to their stack frames. */
const stackFrameMap = new WeakMap<Error, ReadonlyArray<any>>()

/**
 * The `prepareStackTrace` that comes from the `source-map-support` module.
 * We'll use this when the user explicitly wants the stack source mapped.
 */
let prepareStackTraceWithSourceMap: (
  error: Error,
  frames: ReadonlyArray<any>
) => string

/**
 * Capture the error's stack frames and return a standard, un-source mapped
 * stack trace.
 */
function prepareStackTrace(error: Error, frames: ReadonlyArray<any>) {
  stackFrameMap.set(error, frames)

  // Ideally we'd use the default `Error.prepareStackTrace` here but it's
  // undefined so V8 must doing something fancy. Instead we'll do a decent
  // impression.
  return error + frames.map((frame) => `\n    at ${frame}`).join('')
}

/** Enable source map support in the current process. */
export function enableSourceMaps() {
  sourceMapSupport.install({
    environment: 'node',
    handleUncaughtExceptions: false,
    retrieveSourceMap
  })

  const AnyError = Error as any
  // We want to keep `source-map-support`s `prepareStackTrace` around to use
  // later, but our cheaper `prepareStackTrace` should be the default.
  prepareStackTraceWithSourceMap = AnyError.prepareStackTrace
  AnyError.prepareStackTrace = prepareStackTrace
}

/**
 * Make a copy of the error with a source-mapped stack trace. If it couldn't
 * perform the source mapping, it'll use the original error stack.
 */
export function withSourceMappedStack(error: unknown): Error {
  // Guard against `throw "Foo"` which is totally a thing that can happen
  if (typeof error === 'string') {
    return {
      name: 'StringError',
      message: error
    }
  }

  let message

  if (error && typeof error === 'object' && 'message' in error) {
    if (error.message === null) {
      message = 'null'
    } else if (error.message === undefined) {
      message = 'undefined'
    } else if (typeof error.message === 'string') {
      message = error.message
    } else if (typeof error.message === 'object') {
      message = JSON.stringify(
        error.message,
        Object.getOwnPropertyNames(error.message)
      )
    } else {
      message = `${error.message}`
    }
  } else {
    message = '[Unknown]'
  }

  return {
    name:
      error &&
      typeof error === 'object' &&
      'name' in error &&
      typeof error.name === 'string'
        ? error.name
        : '[Unknown]',
    message,
    stack: error instanceof Error ? sourceMappedStackTrace(error) : undefined
  }
}

/** Get the source mapped stack trace for the error. */
function sourceMappedStackTrace(error: Error): string | undefined {
  let frames = stackFrameMap.get(error)

  if (!frames) {
    // At this point there's no guarantee that anyone has actually retrieved the
    // stack on this error which means that our custom prepareStackTrace handler
    // hasn't run and as a result of that we don't have the native frames stored
    // in our weak map. In order to get around that we'll eagerly access the
    // stack, forcing our handler to run which should ensure that the native
    // frames are stored in our weak map.
    ;(error.stack || '').toString()
    frames = stackFrameMap.get(error)
  }

  if (!frames) {
    return error.stack
  }

  return prepareStackTraceWithSourceMap(error, frames)
}
