import { ipcMain } from 'electron'
import { manager } from '../../../grpc/service-manager'
import {
  EErrorCodes,
  IRmapRequest,
  IRmapResponse,
  TCommunicationResponse
} from '@manager/common/src'
import { AppWindow } from '../../../app-window'

export const registerRmapIPC = async (mainWindow: AppWindow) => {
  ipcMain.handle(
    'rmap:generate',
    async (
      _,
      data: IRmapRequest
    ): Promise<TCommunicationResponse<IRmapResponse[]>> => {
      try {
        const client = manager.getClient('network', 'NetworkScanner')

        const preparedRequest = {
          ip_addresses: data.ip_addresses || [],
          detect_services: data.detect_services || false,
          full_scan: data.full_scan || false
        }

        const call = client.ScanNetwork(preparedRequest)
        const results: IRmapResponse[] = []

        return await new Promise((_, reject) => {
          call.on('data', (res: any) => {
            log.info('Received data from gRPC stream:', res)

            if (res?.results?.length > 0) {
              log.info('Received streamed response:', res)
              results.push(...res.results)

              if (mainWindow) {
                mainWindow.send('rmap:progress', {
                  total: res.total || 0,
                  scanned: res.scanned || 0,
                  results: results
                })
              }
            }
          })

          call.on('end', () => {
            log.info('Streaming completed, total results:', results.length)

            if (mainWindow) {
              mainWindow.send('rmap:complete', results)
            }
          })

          call.on('error', (err: any) => {
            log.error('gRPC stream error:', err)
            reject({
              error: {
                message: err.message || 'Unknown stream error',
                code: EErrorCodes.RMAP_GENERATION_ERROR
              }
            })
          })
        })
      } catch (error) {
        log.error('RMap streaming handler failed:', error)
        return {
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: EErrorCodes.RMAP_GENERATION_ERROR
          }
        }
      }
    }
  )
}
