import si from 'systeminformation'
import { ISystem, ISystemHardware } from '@manager/common'
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
    /*const isWindows = process.platform === 'win32'
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
    }*/
    const [disk, graphics, cpu, mem, memLayout, osInfo, users] =
      await Promise.all([
        si.fsSize(),
        si.graphics(),
        si.cpu(),
        si.mem(),
        si.memLayout(),
        si.osInfo(),
        si.users()
      ])

    const storageTotal = disk.reduce((acc, d) => acc + d.size, 0)
    const storageUsed = disk.reduce((acc, d) => acc + d.used, 0)
    const storageFree = storageTotal - storageUsed
    const percentUsed = storageUsed / storageTotal

    const gpu = graphics.controllers[0] || {
      vendor: 'Unknown',
      model: 'Unknown',
      vram: 0
    }

    const username =
      users[0]?.user || process.env.USER || process.env.USERNAME || 'Unknown'
    const computername = osInfo.hostname || 'Unknown'

    return {
      storage: {
        total: storageTotal,
        used: storageUsed,
        free: storageFree,
        percent_used: percentUsed
      },
      graphics: {
        manufacturer: gpu.vendor,
        model: gpu.model,
        memory: gpu.vram
      },
      processor: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        speed: cpu.speed, // in GHz
        cores: cpu.cores,
        threads: cpu.processors || cpu.cores
      },
      ram: {
        total: mem.total,
        free: mem.free,
        used: mem.used
      },
      memoryLayout: memLayout,
      username,
      computername
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
