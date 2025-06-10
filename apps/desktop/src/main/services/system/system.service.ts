import si from 'systeminformation'
import { ISystem, ISystemHardware } from '@manager/common/src'
import { runPowerShellScript } from '../../utils/powershell'
import path from 'node:path'
import { runAppleScript } from '../../utils/applescript'
import { manager } from '../../grpc/service-manager'

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
  }
}
