import { getUpdatesURL, getChannel } from './dist-info'
import { version, productName } from './package.json'

const channel = getChannel()

const s = JSON.stringify

export function getReplacements() {
  const isDevBuild = channel === 'development'

  return {
    __DARWIN__: process.platform === 'darwin',
    __WIN32__: process.platform === 'win32',
    __LINUX__: process.platform === 'linux',
    __APP_NAME__: s(productName),
    __REPO_OWNER__: s('codevault-llc'),
    __REPO_NAME__: s('manager'),
    __APP_VERSION__: s(version),
    __DEV__: isDevBuild,
    __DEV_SECRETS__: isDevBuild || !process.env.DESKTOP_OAUTH_CLIENT_SECRET,
    __RELEASE_CHANNEL__: s(channel),
    __UPDATES_URL__: s(getUpdatesURL()),
    'process.platform': s(process.platform),
    'process.env.NODE_ENV': s(process.env.NODE_ENV || 'development'),
    'process.env.TEST_ENV': s(process.env.TEST_ENV)
  }
}
