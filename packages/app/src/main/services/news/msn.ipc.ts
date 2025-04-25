import { EErrorCodes } from '@shared/helpers'
import { TCommunicationResponse } from '@shared/types/ipc'
import { INews } from '@shared/types/news'
import { ipcMain } from 'electron'
import { db } from 'src/main/database/data-source'
import { msnServices } from './msn.service'

export const loadMsnServices = async () => {
  ipcMain.handle(
    'msn:news',
    async (): Promise<TCommunicationResponse<INews[]>> => {
      try {
        const news = await db.query.news.findMany({
          with: {
            provider: true,
            thumbnail: true
          },
          limit: 15
        })

        if (news.length === 0) {
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
