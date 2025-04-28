import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { INews } from '@shared/types/news'
import { ipcMain } from 'electron'
import { msnServices } from './msn.service'
import { shell } from 'electron'
import logger from '@main/logger'

export const registerMsnIPC = async () => {
  ipcMain.handle(
    'msn:news',
    async (): Promise<TCommunicationResponse<INews[]>> => {
      try {
        const news = await msnServices.getLatestNews()

        console.log('MSN news', news)

        if (
          news.length === 0 ||
          news[0]?.publishedDate < new Date(Date.now() - 60 * 60 * 1000)
        ) {
          const news = await msnServices.requestLatestNews()

          return {
            data: news.map((item) => {
              return {
                id: item.id.toString(),
                title: item.title,
                summary: item.summary ?? '',
                category: item.category,
                keywords: item.keywords ?? [],
                homepageUrl: item.homepageUrl,
                publishedDate: item.publishedDate,
                provider: {
                  brandId: item.provider.brandId,
                  brandName: item.provider.brandName,
                  brandUrl: item.provider.brandUrl,
                  brandLogoUrl: item.provider.brandLogoUrl
                },
                thumbnail: {
                  height: item.thumbnail.originalHeight,
                  url: item.thumbnail.originalUrl,
                  width: item.thumbnail.originalWidth,
                  caption: item.thumbnail.caption ?? ''
                }
              }
            })
          }
        }

        return {
          data: news.map((item) => {
            return {
              id: item.id.toString(),
              title: item.title,
              summary: item.summary ?? '',
              category: item.category,
              keywords: item.keywords ?? [],
              homepageUrl: item.homepageUrl,
              publishedDate: item.publishedDate,
              provider: {
                brandId: item.provider.brandId,
                brandName: item.provider.brandName,
                brandUrl: item.provider.brandUrl,
                brandLogoUrl: item.provider.brandLogoUrl
              },
              thumbnail: {
                height: item.thumbnail.originalHeight,
                url: item.thumbnail.originalUrl,
                width: item.thumbnail.originalWidth,
                caption: item.thumbnail.caption ?? ''
              }
            }
          })
        }
      } catch (error) {
        logger.error('Failed to fetch news', {
          error
        })

        return {
          error: {
            code: EErrorCodes.FORBIDDEN,
            message: 'error.forbidden'
          }
        }
      }
    }
  )

  ipcMain.handle('msn:open', async (_, url: string) => {
    try {
      await shell.openExternal(url)

      return {
        data: true
      }
    } catch (error) {
      logger.error('Failed to open URL', {
        error
      })

      return {
        error: {
          code: EErrorCodes.FORBIDDEN,
          message: 'error.forbidden'
        }
      }
    }
  })
}
