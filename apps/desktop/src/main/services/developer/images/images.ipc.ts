import { Buffer } from 'buffer'
import { PassThrough } from 'stream'

import { EErrorCodes } from '@shared/helpers'
import {
  IConvertedImageData,
  IConvertedImageResponse
} from '@shared/types/image/image'
import { TCommunicationResponse } from '@shared/types/ipc'
import archiver from 'archiver'
import { ipcMain } from 'electron'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'


export const registerImageIPC = async () => {
  ipcMain.handle(
    'images:convert',
    async (
      _,
      data: IConvertedImageData
    ): Promise<TCommunicationResponse<IConvertedImageResponse>> => {
      try {
        const { image, outputs } = data

        // Step 1: Convert input buffer
        const inputBuffer = Buffer.from(image.buffer)

        // Step 2: Create an archive and memory stream
        const archiveStream = new PassThrough()
        const archive = archiver('zip', { zlib: { level: 9 } })
        archive.pipe(archiveStream)

        // Step 3: Process outputs
        const promises = outputs.map(async (output) => {
          const resized = sharp(inputBuffer).resize(
            output.width,
            output.height,
            {
              fit: 'cover'
            }
          )

          let formatBuffer: Buffer

          if (output.format === 'png') {
            formatBuffer = await resized.png().toBuffer()
          } else if (output.format === 'ico') {
            const pngBuffer = await resized.png().toBuffer()
            formatBuffer = await pngToIco([pngBuffer]) // Correct ICO format
          } else if (output.format === 'icns') {
            formatBuffer = await resized.png().toBuffer() // Use PNG as ICNS requires custom tooling
          } else {
            throw new Error(`Unsupported format: ${output.format}`)
          }

          archive.append(formatBuffer, { name: output.name })
        })

        await Promise.all(promises)
        await archive.finalize()

        // Step 4: Collect zip from the stream
        const chunks: Buffer[] = []
        for await (const chunk of archiveStream) {
          chunks.push(chunk)
        }

        const zipBuffer = Buffer.concat(chunks)

        return {
          data: {
            buffer: Array.from(zipBuffer), // Send as number[] for Electron IPC
            filename: 'icons.zip',
            mime: 'application/zip'
          }
        }
      } catch (error) {
        console.error('Error converting images:', error)
        return {
          error: {
            code: EErrorCodes.FILE_CONVERSION_ERROR,
            message: 'Failed to convert and zip image outputs.'
          }
        }
      }
    }
  )
}
