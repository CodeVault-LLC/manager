import si from 'systeminformation'

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

export async function getNetworkUsage() {
  const stats = await si.networkStats()

  let rx = 0 // received bytes
  let tx = 0 // transmitted bytes

  for (const iface of stats) {
    rx += iface.rx_bytes
    tx += iface.tx_bytes
  }

  return {
    received: rx,
    transmitted: tx
  }
}

export async function getAvailablePort(): Promise<number> {
  const net = await import('node:net')
  return await new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(0, () => {
      const port = (server.address() as any).port
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })
}
