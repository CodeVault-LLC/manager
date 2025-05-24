import fs from 'node:fs'
import os from 'node:os'

import { IBrowser } from '@shared/types/system'

import logger from '../../logger'

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

export const browserServices = {
  isBrowserInstalled: (browser: IBrowser) => {
    const paths = browser.paths[process.platform]
    if (!paths) return false
    return paths.some((path: string) => {
      try {
        return fs.existsSync(path)
      } catch (error) {
        logger.error(
          `Error checking if browser is installed at path ${path}:`,
          error
        )
        return false
      }
    })
  }
}
