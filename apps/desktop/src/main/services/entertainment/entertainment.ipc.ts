import { ipcMain, app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import mime from 'mime-types'
import crypto from 'crypto'
import {
  EErrorCodes,
  IMedia,
  IMediaResponse,
  TCommunicationResponse
} from '@manager/common/src'
import { entertainmentService } from './entertainment.service'

export const registerEntertainmentIPC = async () => {
  ipcMain.handle(
    'entertainment:media:upload',
    async (_, filePath: string): Promise<TCommunicationResponse<IMedia>> => {
      try {
        const fileStats = await fs.stat(filePath)
        const fileName = path.basename(filePath)
        const fileMime = mime.lookup(filePath) || 'application/octet-stream'
        const id = crypto.randomUUID()

        const destDir = path.join(app.getPath('userData'), 'media')
        await fs.mkdir(destDir, { recursive: true })

        const destPath = path.join(destDir, `${id}${path.extname(fileName)}`)
        await fs.copyFile(filePath, destPath)

        let mediaThumbnail: string | undefined
        let mediaLength: number | undefined

        if (fileMime.startsWith('video/')) {
          mediaThumbnail = await entertainmentService.generateThumbnail({
            id,
            name: fileName,
            mime: fileMime,
            size: fileStats.size,
            path: destPath,
            thumbnail: ''
          })

          mediaLength = await entertainmentService.getMediaVideoLength({
            id,
            name: fileName,
            mime: fileMime,
            size: fileStats.size,
            path: destPath
          })
        }

        const media: IMedia = {
          id,
          name: fileName,
          mime: fileMime,
          size: fileStats.size,
          path: destPath,
          thumbnail: mediaThumbnail,
          length: mediaLength
        }

        await entertainmentService.uploadMedia(media)

        return { data: media }
      } catch (error) {
        log.error('Failed to upload media', error)

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
    'entertainment:media:list',
    async (
      _,
      limit: number,
      query: string,
      filters: string[]
    ): Promise<TCommunicationResponse<IMediaResponse>> => {
      try {
        const media = await entertainmentService.getAllMedia(
          limit,
          query,
          filters
        )

        const totalMediaFiles = await entertainmentService.getMediaCount(
          query,
          filters
        )

        return {
          data: {
            data: media,
            total: totalMediaFiles,
            page: 1, // Assuming page 1 for simplicity
            limit: limit || 10 // Default limit if not provided
          }
        }
      } catch (error) {
        log.error('Failed to list media files', error)

        return {
          error: {
            code: EErrorCodes.BAD_REQUEST,
            message: 'error.internal'
          }
        }
      }
    }
  )
}
