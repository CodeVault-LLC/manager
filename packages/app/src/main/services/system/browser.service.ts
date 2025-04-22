import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { IBrowser } from '@shared/types/system'
import { eq } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { db } from '../../database/data-source'
import { browsers } from '../../database/models/browser.model'
import fs from 'node:fs'
import os from 'node:os'

const username = os.userInfo().username

export const browserList = [
  {
    id: 'google-chrome',
    name: 'Google Chrome',
    description:
      'Google Chrome is a cross-platform web browser developed by Google.',
    icon: 'chrome',
    paths: {
      windows: [
        `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      ],
      darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
      linux: [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
      ]
    }
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    description:
      'Microsoft Edge is a cross-platform web browser developed by Microsoft.',
    icon: 'edge',
    paths: {
      windows: [
        `C:\\Users\\${username}\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default`
      ],
      darwin: [
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
      ],
      linux: [
        '/usr/bin/microsoft-edge',
        '/usr/bin/microsoft-edge-dev',
        '/usr/bin/microsoft-edge-beta'
      ]
    }
  }
]
export const loadBrowserServices = () => {
  const isBrowserInstalled = (browser: IBrowser) => {
    const paths = browser.paths[process.platform]
    if (!paths) return false
    return paths.some((path: string) => {
      try {
        return fs.existsSync(path)
      } catch (e) {
        return false
      }
    })
  }

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
        console.error('Error loading browser services:', error)
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
            const isInstalled = isBrowserInstalled(browser as IBrowser)

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
        console.error('Error refreshing browser services:', error)
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
