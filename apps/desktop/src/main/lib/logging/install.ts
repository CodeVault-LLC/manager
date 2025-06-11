import { log } from '../../logger'
import { formatLogMessage } from './format-log-message'

const g = global as any

g.log = {
  error(message: string, error?: Error) {
    void log('error', '[main] ' + formatLogMessage(message, error))
  },
  warn(message: string, error?: Error) {
    void log('warn', '[main] ' + formatLogMessage(message, error))
  },
  info(message: string, error?: Error) {
    void log('info', '[main] ' + formatLogMessage(message, error))
  },
  debug(message: string, error?: Error) {
    void log('debug', '[main] ' + formatLogMessage(message, error))
  }
} as IDesktopLogger
