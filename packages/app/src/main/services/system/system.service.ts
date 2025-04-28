import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain } from 'electron'
import { ConfStorage } from '../../store'
import { ETheme, ISystem, ISystemHardware } from '@shared/types/system'
import { loadBrowserServices } from './browser.service'
import si from 'systeminformation'

export const loadSystemServices = () => {
  ipcMain.handle(
    'system:initial',
    async (): Promise<
      TCommunicationResponse<{ theme: ETheme; language: string }>
    > => {
      try {
        const theme = (await ConfStorage.getSecureData('theme')) ?? ETheme.LIGHT
        const language = (await ConfStorage.getSecureData('language')) ?? 'en'

        return { data: { theme, language } }
      } catch (error: any) {
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
    'system:setSystem',
    async (_, system: ISystem): Promise<TCommunicationResponse<boolean>> => {
      try {
        await ConfStorage.setSecureData('theme', system.theme)
        await ConfStorage.setSecureData('language', system.language)

        return { data: true }
      } catch (error: any) {
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
    'system:getHardware',
    async (): Promise<TCommunicationResponse<ISystemHardware>> => {
      try {
        const cpu = await si.cpu()
        const memory = await si.mem()
        const os = await si.osInfo()
        const graphics = await si.graphics()
        const network = await si.networkInterfaces()
        const motherboard = await si.baseboard()
        const battery = await si.battery()

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

        return { data: hardware }
      } catch (error: any) {
        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )

  loadBrowserServices()
}
