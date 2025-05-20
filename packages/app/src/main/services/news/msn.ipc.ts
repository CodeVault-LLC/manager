import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { INews } from '@shared/types/news'
import { ipcMain } from 'electron'
import { msnNewsServices } from './msn.service'
import logger from '@main/logger'
import { msnSportServices } from '../sports/msn-sport.service'

export const registerMsnIPC = async () => {
  ipcMain.handle(
    'msn:news',
    async (): Promise<TCommunicationResponse<INews[]>> => {
      try {
        const news = await msnNewsServices.getLatestNews()

        if (
          news.length === 0 ||
          news[0]?.publishedDate < new Date(Date.now() - 60 * 60 * 1000)
        ) {
          //const news = await msnNewsServices.requestLatestNews()
          const news: Awaited<
            ReturnType<(typeof msnNewsServices)['getLatestNews']>
          > = []

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

  ipcMain.handle(
    'msn:sport',
    async (): Promise<TCommunicationResponse<any>> => {
      try {
        const latestGames = await msnSportServices.getLatestGames()

        const updateDateThreshold = 60 * 60 * 1000 // 1 hour in milliseconds|

        if (
          latestGames.length === 0 ||
          new Date(latestGames[0].league.lastUpdated ?? '').getTime() +
            updateDateThreshold <
            Date.now()
        ) {
          await msnSportServices.requestLatestGames()

          const latestGames = await msnSportServices.getLatestGames()

          return { data: latestGames }
        }

        return {
          data: latestGames
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
}
