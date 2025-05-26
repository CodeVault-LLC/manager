import { Buffer } from 'buffer'

import { EErrorCodes } from '@shared/helpers'
import {
  IConvertedImageData,
  IConvertedImageResponse
} from '@shared/types/image/image'
import { TCommunicationResponse } from '@shared/types/ipc'
import { ipcMain } from 'electron'

import { ConvertImageRequest } from '../../../grpc/__generated/system'
import { manager } from '../../../grpc/service-manager'
import logger from '../../../logger'

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
                logger.error('gRPC call failed:', err)
                return reject(
                  new Error(err?.message || 'gRPC response missing')
                )
              }
              resolve(res)
            })
          }
        )

        logger.info('gRPC call successful:', response)

        return {
          data: {
            buffer: Array.from(response.buffer), // serialize for IPC
            filename: response.filename,
            mime: response.mime
          }
        }
      } catch (error) {
        logger.error('Image conversion failed:', error)
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
