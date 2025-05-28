import path from 'node:path'

import { app } from 'electron'
import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize, json, align } = format

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  align(),
  printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`
  })
)
const fileFormat = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json())

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: fileFormat,
  transports: [
    new transports.File({
      filename: path.join(app.getPath('logs'), 'error.log'),
      level: 'error'
    }),
    new transports.File({
      filename: path.join(app.getPath('logs'), 'combined.log')
    })
  ]
})

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new transports.Console({
      format: consoleFormat
    })
  )
}

export default logger
