import { Buffer } from 'buffer'
import { ipcMain } from 'electron'
import { ConvertImageRequest } from '../../../grpc/__generated/system'
import { manager } from '../../../grpc/service-manager'
import {
  EErrorCodes,
  IConvertedImageData,
  IConvertedImageResponse,
  TCommunicationResponse
} from '@manager/common/src'

export const registerImageIPC = async () => {
  ipcMain.handle(
    'images:convert',
    async (
      _,
      data: IConvertedImageData
    ): Promise<TCommunicationResponse<IConvertedImageResponse>> => {
      try {
        const { image, outputs } = data

        const client = manager.getClient('system', 'ImageConverter')

        const preparedRequest: ConvertImageRequest = {
          buffer: Buffer.from(image.buffer),
          outputs: outputs.map((output) => ({
            width: output.width,
            height: output.height,
            format: output.format,
            name: output.name
          }))
        }

        const response = await new Promise<IConvertedImageResponse>(
          (resolve, reject) => {
            client.ConvertImage(preparedRequest, (err, res) => {
              if (err || !res) {
                log.error('gRPC call failed:', err)
                return reject(
                  new Error(err?.message || 'gRPC response missing')
                )
              }
              resolve(res)
            })
          }
        )

        log.info('gRPC call successful:', response)

        return {
          data: {
            buffer: Array.from(response.buffer), // serialize for IPC
            filename: response.filename,
            mime: response.mime
          }
        }
      } catch (error) {
        log.error('Image conversion failed:', error)
        return {
          error: {
            code: EErrorCodes.FILE_CONVERSION_ERROR,
            message: 'Failed to convert image via gRPC.'
          }
        }
      }
    }
  )
}
