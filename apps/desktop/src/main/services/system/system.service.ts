import si from 'systeminformation'
import { INetwork, ISystem, ISystemHardware } from '@manager/common/src'
import { runPowerShellScript } from '../../utils/powershell'
import log from '@main/logger'
import path from 'node:path'
import { runAppleScript } from '../../utils/applescript'
import { manager } from '../../grpc/service-manager'
import { runCommand } from '../../utils/command'

export const systemServices = {
  getSystemHardware: async (): Promise<ISystemHardware> => {
    const system = await si.system()
    log.debug('System:', system)

    const cpu = await si.cpu()
    log.debug('CPU:', cpu)

    const memory = await si.mem()
    log.debug('Memory:', memory)

    const os = await si.osInfo()
    log.debug('OS:', os)

    const graphics = await si.graphics()
    log.debug('Graphics:', graphics)

    const network = await si.networkInterfaces()
    log.debug('Network:', network)

    const motherboard = await si.baseboard()
    log.debug('Motherboard:', motherboard)

    const battery = await si.battery()
    log.debug('Battery:', battery)

    const networkParsed = network.map((item) => ({
      name: item.iface,
      ip4: item.ip4,
      mac: item.mac,
      ip6: item.ip6
    }))

    const hardware: ISystemHardware = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed,
        cores: cpu.cores
      },
      memory: {
        total: memory.total,
        free: memory.free,
        used: memory.used
      },
      graphics: graphics.controllers.map((controller) => ({
        manufacturer: controller.vendor,
        model: controller.model,
        memory: controller.memoryTotal ?? 0
      })),
      network: networkParsed,
      os: {
        arch: os.arch,
        platform: os.platform,
        release: os.release
      },
      battery: {
        isCharging: battery.isCharging,
        percent: battery.percent
      },
      motherboard: {
        manufacturer: motherboard.manufacturer,
        model: motherboard.model
      }
    }

    return hardware
  },

  getSystemInfo: async (): Promise<ISystem> => {
    const isWindows = process.platform === 'win32'
    const isMac = process.platform === 'darwin'

    if (isWindows) {
      const scriptPath = path
        .resolve(__dirname, '../../resources/scripts/system-information.ps1')
        .replace('app.asar', 'app.asar.unpacked')

      const data = await runPowerShellScript<ISystem>(scriptPath)

      return data
    } else if (isMac) {
      const scriptPath = path
        .resolve(__dirname, '../../resources/scripts/system-information.scpt')
        .replace('app.asar', 'app.asar.unpacked')

      const data = await runAppleScript<ISystem>(scriptPath)

      return data
    }

    log.warn('getSystemInfo is not implemented for this platform.')
    return Promise.reject('getSystemInfo is not implemented for this platform.')
  },

  getStorageOverview: async (): Promise<any> => {
    const client = manager.getClient('system', 'FileSpaceAnalyzer')

    const preparedRequest = {
      path: process.platform === 'win32' ? 'C:\\' : '/',
      use_cache: true
    }

    const response = await new Promise<any>((resolve, reject) => {
      client.GetFileSpaceOverview(preparedRequest, (err, res) => {
        if (err || !res) {
          log.error('gRPC call failed:', err)
          return reject(new Error(err?.message || 'gRPC response missing'))
        }
        resolve(res)
      })
    })

    log.info('gRPC call successful:', response)

    return response
  },

  getNetwork: async (): Promise<INetwork> => {
    const isMac = process.platform === 'darwin'
    if (!isMac) throw new Error('getNetwork is only implemented for macOS.')

    const networkJSON = await runCommand(
      'system_profiler SPAirPortDataType -json',
      {
        expectedType: 'string',
        defaultValue: '{}',
        timeout: 10000,

        transform: (v) => {
          try {
            return JSON.parse(v)
          } catch (e) {
            log.error('Failed to parse network JSON:', e)
            return {}
          }
        }
      }
    )

    let ssid = ''

    for (const iface of networkJSON['SPAirPortDataType'][0][
      'spairport_airport_interfaces'
    ]) {
      if (iface['_name'] === 'en0' || iface['_name'] === 'en1') {
        const currentNetwork = iface['spairport_current_network_information']
        if (!currentNetwork) continue

        if (currentNetwork['_name']) {
          ssid = currentNetwork['_name'] || ''
        }
      }
    }

    const internalIP = await runCommand('ipconfig getifaddr en0', {
      expectedType: 'string',
      defaultValue: ''
    })

    const macAddress = await runCommand(
      "ifconfig en0 | awk '/ether/ {print $2}'",
      { expectedType: 'string', defaultValue: '' }
    )

    const mtu = await runCommand("ifconfig en0 | grep mtu | awk '{print $4}'", {
      expectedType: 'number',
      defaultValue: 1500
    })

    const gateway = await runCommand(
      'route get default | grep "gateway" | awk \'{print $2}\'',
      { expectedType: 'string', defaultValue: '' }
    )

    const connectionType = await runCommand(
      'networksetup -getinfo Wi-Fi | grep "Link Status" | awk \'{print $3}\'',
      {
        expectedType: 'string',
        defaultValue: 'WiFi',
        match: /^(Wi-Fi|Ethernet)$/
      }
    )

    const externalIP = await runCommand('curl -s https://api.ipify.org', {
      match: /^\d{1,3}(\.\d{1,3}){3}$/,
      defaultValue: ''
    })

    const signalStrength = await runCommand(
      "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk -F': ' '/agrCtlRSSI/{print $2}'",
      { expectedType: 'number', defaultValue: 0 }
    )

    const dns = await runCommand('networksetup -getdnsservers Wi-Fi', {
      transform: (v) => v.split('\n').filter(Boolean),
      defaultValue: []
    })

    const latency = await runCommand(
      "ping -c 1 8.8.8.8 | tail -1 | awk -F '/' '{print $5}'",
      { expectedType: 'number', defaultValue: 0 }
    )

    const pingResult = await runCommand('ping -c 1 8.8.8.8', {
      defaultValue: ''
    })
    const status = pingResult.includes(
      '1 packets transmitted, 1 packets received'
    )
      ? 'online'
      : 'offline'

    const firewallEnabled =
      (await runCommand(
        'defaults read /Library/Preferences/com.apple.alf globalstate',
        { defaultValue: '0' }
      )) === '1'

    const vpnActive = !!(await runCommand('scutil --nc list | grep Connected', {
      defaultValue: ''
    }))

    const openPorts = await runCommand(
      "lsof -i -n -P | grep LISTEN | awk '{print $9}' | cut -d ':' -f2",
      {
        transform: (v) =>
          v
            .split('\n')
            .filter(Boolean)
            .map(Number)
            .filter((n) => !isNaN(n)),
        defaultValue: []
      }
    )

    const activeConnections = await runCommand(
      'netstat -an | grep ESTABLISHED | wc -l',
      { expectedType: 'number', defaultValue: 0 }
    )

    const hostname = await runCommand('scutil --get LocalHostName', {
      defaultValue: ''
    })

    const leaseTime = await runCommand('ipconfig getoption en0 lease_time', {
      defaultValue: ''
    })

    return {
      internalIP,
      externalIP,
      macAddress,
      ssid,
      signalStrength,
      connectionType: connectionType as 'WiFi' | 'Ethernet',
      dns,
      gateway,
      latency,
      speed: { up: 0, down: 0 }, // Add speed test CLI later
      status,
      firewallEnabled,
      vpnActive,
      openPorts,
      activeConnections,
      hostname,
      mtu,
      leaseTime
    }
  }
}
