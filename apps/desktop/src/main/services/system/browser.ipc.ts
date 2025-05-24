import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { IBrowser } from '@shared/types/system'
import { eq } from 'drizzle-orm'
import { ipcMain } from 'electron'

import logger from '../../logger'

import { browserList, browserServices } from './browser.service'

import { db } from '@main/database/data-source'
import { browsers } from '@main/database/models/browser.model'

export const registerBrowserIPC = async () => {
  ipcMain.handle(
    'browser:initial',
    async (): Promise<TCommunicationResponse<IBrowser[]>> => {
      try {
        const browsers = await db.query.browsers.findMany()
        const filteredBrowsers: IBrowser[] = browserList.map((browser) => {
          const browserStored = browsers.find((b) => b.browserId === browser.id)

          return {
            id: browser.id,
            name: browser.name,
            description: browser.description,
            icon: browser.icon,

            paths: browser.paths,

            installed: browserStored ? true : false,
            version: 'N/A',
            synced: browserStored?.synced ?? false,

            syncedAt: browserStored?.syncedAt ?? new Date(),
            createdAt: browserStored?.createdAt ?? new Date()
          }
        })

        return {
          data: filteredBrowsers
        }
      } catch (error) {
        logger.error('Error loading browser services:', error)
        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )

  ipcMain.handle(
    'browser:refresh',
    async (): Promise<TCommunicationResponse<IBrowser[]>> => {
      try {
        await Promise.all(
          browserList.map(async (browser) => {
            const isInstalled = browserServices.isBrowserInstalled(
              browser as IBrowser
            )

            if (!isInstalled) {
              await db
                .delete(browsers)
                .where(eq(browsers.browserId, browser.id))
            } else {
              const exists = await db.query.browsers.findFirst({
                where: eq(browsers.browserId, browser.id)
              })

              if (!exists) {
                await db.insert(browsers).values({
                  browserId: browser.id,
                  path: browser.paths[process.platform][0]
                })
              }
            }
          })
        )

        const initializedBrowsers = await db.query.browsers.findMany()

        const filteredBrowsers: IBrowser[] = browserList.map((browser) => {
          const browserStored = initializedBrowsers.find(
            (b) => b.browserId === browser.id
          )

          return {
            id: browser.id,
            name: browser.name,
            description: browser.description,
            icon: browser.icon,

            paths: browser.paths,

            installed: !!browserStored,
            version: 'N/A',
            synced: browserStored?.synced ?? false,

            syncedAt: browserStored?.syncedAt ?? new Date(),
            createdAt: browserStored?.createdAt ?? new Date()
          }
        })

        return {
          data: filteredBrowsers
        }
      } catch (error) {
        logger.error('Error refreshing browser services:', error)
        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )
}
