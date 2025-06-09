import * as winston from 'winston'
import { mkdir } from 'node:fs/promises'

import memoizeOne from 'memoize-one'

import { getLogDirectoryPath } from './lib/logging/get-log-path'
import { DesktopConsoleTransport } from './desktop-console-transport'
import { DesktopFileTransport } from './desktop-file-transport'
import { LogLevel } from './lib/logging/log-level'

function initializeWinston(path: string): winston.LogMethod {
  const timestamp = () => new Date().toISOString()

  const fileLogger = new DesktopFileTransport({
    logDirectory: path,
    level: 'info',
    format: winston.format.printf(
      ({ level, message }) => `${timestamp()} - ${level}: ${message}`
    )
  })

  // Return undefined (noop function)
  fileLogger.on('error', () => {})

  const consoleLogger = new DesktopConsoleTransport({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
  })

  winston.configure({
    transports: [consoleLogger, fileLogger],
    format: winston.format.simple()
  })

  return winston.log
}

const getLogger = memoizeOne(async () => {
  const logDirectory = getLogDirectoryPath()
  await mkdir(logDirectory, { recursive: true })
  return initializeWinston(logDirectory)
})

export async function log(level: LogLevel, message: string) {
  try {
    const logger = await getLogger()
    await new Promise<void>((resolve, reject) => {
      logger(level, message, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  } catch (error) {
    // Later fallback to send something to renderer or dump to somewhere else.

    // eslint-disable-next-line no-console
    console.error('Failed to log message:', error)
  }
}
