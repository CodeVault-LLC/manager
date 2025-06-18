import { app } from 'electron'
import path from 'path'

/**
 * Gets the absolute path to a resource file,
 * handling both development and production environments.
 */
export function getResourcePath(relativePath: string): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, relativePath)
    : path.join(app.getAppPath(), relativePath)
}
