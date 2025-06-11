import * as winston from 'winston'
import { mkdir } from 'node:fs/promises'

import memoizeOne from 'memoize-one'

import { getLogDirectoryPath } from './lib/logging/get-log-path'
import { DesktopConsoleTransport } from './desktop-console-transport'
import { DesktopFileTransport } from './desktop-file-transport'
import { LogLevel } from './lib/logging/log-level'

function initializeWinston(path: string): winston.Logger {
  const timestamp = () => new Date().toISOString()

  const fileLogger = new DesktopFileTransport({
    logDirectory: path,
    level: 'info',
    format: winston.format.printf(
      ({ level, message }) => `${timestamp()} - ${level}: ${message}`
    )
  })

  fileLogger.on('error', () => {})

  const consoleLogger = new DesktopConsoleTransport({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
  })

  // Create and return a new logger instance
  return winston.createLogger({
    transports: [consoleLogger, fileLogger],
    format: winston.format.simple()
  })
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
      logger.log(level, message, (error) => {
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
