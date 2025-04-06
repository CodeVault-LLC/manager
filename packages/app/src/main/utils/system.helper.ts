import cp from 'node:child_process'

export const getSystemVersion = () => {
  const os = process.platform
  const version = process.getSystemVersion()

  if (os === 'win32') {
    if (version.includes('10')) {
      return 'Windows 10'
    }
    if (version.includes('11')) {
      return 'Windows 11'
    }
    if (version.includes('8')) {
      return 'Windows 8'
    }
    if (version.includes('7')) {
      return 'Windows 7'
    }
    if (version.includes('XP')) {
      return 'Windows XP'
    }
    if (version.includes('Vista')) {
      return 'Windows Vista'
    }

    return `Windows ${version}`
  }
  if (os === 'darwin') {
    if (version.includes('13')) {
      return 'MacOS 13'
    }
    if (version.includes('12')) {
      return 'MacOS 12'
    }
    if (version.includes('11')) {
      return 'MacOS 11'
    }
    if (version.includes('10')) {
      return 'MacOS 10'
    }
    if (version.includes('9')) {
      return 'MacOS 9'
    }

    return `MacOS ${version}`
  }
  if (os === 'linux') {
    return `Linux ${version}`
  }

  return `Unknown OS ${version}`
}

type DiskInformation = {
  caption: string
  freeSpace: number
  size: number
}

export const getDiskInformation = async (): Promise<DiskInformation[]> => {
  if (process.platform === 'win32') {
    return new Promise((resolve, reject) => {
      resolve([
        {
          caption: 'C:',
          freeSpace: 100,
          size: 500
        }
      ])
    })
  } else if (process.platform === 'darwin') {
    return new Promise((resolve, reject) => {
      cp.exec('df -H', (error, stdout) => {
        if (error) {
          reject(error)
        } else {
          const lines = stdout.trim().split('\n').slice(1)
          const disks = lines.map((line) => {
            const [filesystem, size, used, available, capacity, mountpoint] =
              line.trim().split(/\s+/)
            return {
              caption: mountpoint,
              freeSpace: parseInt(available),
              size: parseInt(size)
            }
          })
          resolve(disks)
        }
      })
    })
  } else if (process.platform === 'linux') {
    return new Promise((resolve, reject) => {
      cp.exec('df -h', (error, stdout) => {
        if (error) {
          reject(error)
        } else {
          const lines = stdout.trim().split('\n').slice(1)
          const disks = lines.map((line) => {
            const [filesystem, size, used, available, capacity, mountpoint] =
              line.trim().split(/\s+/)
            return {
              caption: mountpoint,
              freeSpace: parseInt(available),
              size: parseInt(size)
            }
          })
          resolve(disks)
        }
      })
    })
  } else {
    return Promise.reject(new Error('Unsupported platform'))
  }
}
