import { IMedia } from '@manager/common'
import fs from 'node:fs'

import ffmpegPath from 'ffmpeg-static-electron'
import ffprobePath from 'ffprobe-static'
import ffmpeg from 'fluent-ffmpeg'

import path from 'node:path'
import { ffmpegExec } from '../../lib/ffmpeg/ffmpeg'

import { DataService } from '@manager/data'
import { files } from '@manager/data/models/schema'
import { SQL } from '@manager/data/types'

ffmpeg.setFfmpegPath(
  (ffmpegPath.path ?? '').replace('app.asar', 'app.asar.unpacked')
)
ffmpeg.setFfprobePath(ffprobePath.path.replace('app.asar', 'app.asar.unpacked'))

export const entertainmentService = {
  uploadMedia: async (media: IMedia): Promise<void> => {
    try {
      const db = DataService.getInstance().getDatabase()

      await db.insert(files).values({
        id: media.id,
        name: media.name,
        mime: media.mime,
        size: media.size,
        path: media.path || '',
        thumbnail: media.thumbnail || '',
        length: media.length || 0
      })

      log.info(`Media uploaded successfully: ${media.name}`)
    } catch (error) {
      log.error('Failed to upload media', error)
      throw new Error('Failed to upload media')
    }
  },

  getMediaById: async (mediaId: string): Promise<IMedia | null> => {
    try {
      const db = DataService.getInstance().getDatabase()
      const { eq } = DataService.getInstance().getDatabaseSQL()

      const media = await db.query.files.findFirst({
        where: eq(files.id, mediaId)
      })

      if (!media) {
        return null
      }

      return {
        id: media.id,
        mime: media.mime,
        name: media.name,
        size: media.size,
        dimensions: media.dimensions ?? '',
        length: media.length ?? 0,
        path: media.path,
        thumbnail: media.thumbnail ?? ''
      }
    } catch (error) {
      log.error('Failed to retrieve media by id', error)
      throw new Error('Failed to retrieve media by id')
    }
  },

  getAllMedia: async (
    limit: number,
    searchQuery: string,
    _: string[]
  ): Promise<IMedia[]> => {
    const db = DataService.getInstance().getDatabase()
    const { and, desc, sql } = DataService.getInstance().getDatabaseSQL()

    const conditions: SQL[] = []

    // Search by name (case-insensitive, partial match)
    if (searchQuery) {
      conditions.push(
        sql`LOWER(${files.name}) LIKE LOWER(${`%${searchQuery}%`})`
      )
    }

    // Filter by mime type category
    /*if (filters.length > 0) {
      const mimeConditions = filters
        .map((filter) => {
          if (filter === 'image') return sql`${files.mime} LIKE 'image/%'`
          if (filter === 'video') return sql`${files.mime} LIKE 'video/%'`
          return null
        })
        .filter(
          (cond): cond is SQL<unknown> => cond !== null && cond !== undefined
        )

      if (mimeConditions.length > 0) {
        conditions.push(...mimeConditions)
      }
    }*/

    const query = db
      .select()
      .from(files)
      .where(and(...conditions))
      .orderBy(desc(files.createdAt))
      .limit(limit)

    const rows = await query

    return rows.map((file) => ({
      id: file.id,
      name: file.name,
      mime: file.mime,
      size: file.size,
      path: file.path ?? '',
      thumbnail: file.thumbnail ?? undefined,
      length: file.length ?? undefined,
      categoryId: file.categoryId ?? undefined,
      dimensions: file.dimensions ?? undefined,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }))
  },

  getMediaCount: async (searchQuery: string, _: string[]): Promise<number> => {
    const db = DataService.getInstance().getDatabase()
    const { and, sql } = DataService.getInstance().getDatabaseSQL()

    const conditions: SQL[] = []

    // Search by name (case-insensitive, partial match)
    if (searchQuery) {
      conditions.push(
        sql`LOWER(${files.name}) LIKE LOWER(${`%${searchQuery}%`})`
      )
    }

    // Filter by mime type category
    /*if (filters.length > 0) {
      const mimeConditions = filters
        .map((filter) => {
          if (filter === 'image') return sql`${files.mime} LIKE 'image/%'`
          if (filter === 'video') return sql`${files.mime} LIKE 'video/%'`
          return null
        })
        .filter(
          (cond): cond is SQL<unknown> => cond !== null && cond !== undefined
        )

      if (mimeConditions.length > 0) {
        conditions.push(...mimeConditions)
      }
    }*/

    const count = await db
      .select({ count: sql`COUNT(*)` })
      .from(files)
      .where(and(...conditions))

    return count[0].count as number
  },

  generateThumbnail: async (media: IMedia): Promise<string> => {
    try {
      const thumbnailPath = `${media.path}.thumbnail.jpg`

      const folder = path.dirname(thumbnailPath)

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
      }

      await ffmpegExec(
        [
          'FFMPEG',
          '-i',
          media.path || '',
          '-ss',
          '00:00:01.000',
          '-vframes',
          '1',
          thumbnailPath
        ],
        media.path || '',
        thumbnailPath
      )

      log.info(`Thumbnail generated successfully for: ${media.name}`)
      return thumbnailPath
    } catch (error) {
      log.error('Failed to generate thumbnail', error)
      throw new Error('Failed to generate thumbnail')
    }
  },

  getMediaVideoLength: async (media: IMedia): Promise<number> => {
    try {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(media.path, (err, metadata) => {
          if (err) {
            log.error('Failed to get video length', err)
            return reject(err)
          }

          const duration = metadata.format.duration || 0
          log.info(`Video length for ${media.name}: ${duration} seconds`)
          resolve(duration)
        })
      })
    } catch (error) {
      log.error('Failed to get media video length', error)
      throw new Error('Failed to get media video length')
    }
  },

  getMediaImageDimensions: async (media: IMedia): Promise<string> => {
    try {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(media.path, (err, metadata) => {
          if (err) {
            log.error('Failed to get image dimensions', err)
            return reject(err)
          }

          const { width, height } = metadata.streams[0]
          const dimensions = `${width}x${height}`
          log.info(`Image dimensions for ${media.name}: ${dimensions}`)
          resolve(dimensions)
        })
      })
    } catch (error) {
      log.error('Failed to get media image dimensions', error)
      throw new Error('Failed to get media image dimensions')
    }
  },

  getFfmpegPath: (): string => {
    if (!ffmpegPath.path || !ffprobePath.path) {
      log.error('FFmpeg or FFprobe path is not set')
      return ''
    }

    const fileFound = path.resolve(ffmpegPath.path)
    if (!fileFound) {
      log.error('FFmpeg path is not valid')
      return ''
    }

    return fileFound
  },

  removeMediaById: async (mediaId: string): Promise<void> => {
    try {
      const db = DataService.getInstance().getDatabase()
      const { eq } = DataService.getInstance().getDatabaseSQL()

      const media = await entertainmentService.getMediaById(mediaId)
      if (!media) {
        log.warn(`Media with ID ${mediaId} not found`)
        return
      }

      // Remove the media file from the filesystem
      if (media.path && fs.existsSync(media.path)) {
        fs.unlinkSync(media.path)
        log.info(`Media file removed from filesystem: ${media.path}`)
      }

      // Remove the thumbnail if it exists
      if (media.thumbnail && fs.existsSync(media.thumbnail)) {
        fs.unlinkSync(media.thumbnail)
        log.info(`Thumbnail removed from filesystem: ${media.thumbnail}`)
      }

      // Remove the media entry from the database
      await db.delete(files).where(eq(files.id, mediaId))
      log.info(`Media entry removed from database: ${mediaId}`)
    } catch (error) {
      log.error('Failed to remove media by id', error)
      throw new Error('Failed to remove media by id')
    }
  }
}
