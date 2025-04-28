import logger from '@main/logger'
import { ISystemHardware } from '@shared/types/system'
import si from 'systeminformation'

export const systemServices = {
  getSystemHardware: async (): Promise<ISystemHardware> => {
    const system = await si.system()
    logger.debug('System:', system)

    const cpu = await si.cpu()
    logger.debug('CPU:', cpu)

    const memory = await si.mem()
    logger.debug('Memory:', memory)

    const os = await si.osInfo()
    logger.debug('OS:', os)

    const graphics = await si.graphics()
    logger.debug('Graphics:', graphics)

    const network = await si.networkInterfaces()
    logger.debug('Network:', network)

    const motherboard = await si.baseboard()
    logger.debug('Motherboard:', motherboard)

    const battery = await si.battery()
    logger.debug('Battery:', battery)

    const networkParsed = Array.isArray(network)
      ? network.map((item) => ({
          name: item.iface,
          ip4: item.ip4,
          mac: item.mac,
          ip6: item.ip6
        }))
      : [
          {
            name: network.iface,
            ip4: network.ip4,
            mac: network.mac,
            ip6: network.ip6
          }
        ]

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
  }
}
