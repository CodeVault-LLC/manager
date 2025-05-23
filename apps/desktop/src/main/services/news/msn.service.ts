import { MsnNewsResponse } from '@shared/types/msn/msn-news'
import axios from 'axios'
import { desc, eq } from 'drizzle-orm'

import { db } from '@main/database/data-source'
import { news, newsProvider, newsThumbnail } from '@main/database/models/schema'
import logger from '@main/logger'

const msnApi = axios.create({
  baseURL: 'https://api.msn.com/news/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

msnApi.interceptors.response.use(
  (response) => {
    logger.debug('MSN API response', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    })

    return response
  },
  (error) => {
    logger.error('Error fetching news from MSN API', {
      error: error.message
    })
    return Promise.reject(error)
  }
)

export const msnNewsServices = {
  requestLatestNews: async () => {
    try {
      const defaultApiKey = '0QfOX3Vn51YCzitbLaRkTTBadtWpgTN8NZLW0C1SEM'
      const timeOut = 2000
      const newsSkip = 24
      const market = 'nb-no'

      const msnFeedUrl = `feed/pages/channelfeed?&timeOut=${timeOut}&apikey=${defaultApiKey}&cm=${market}&newsSkip=${newsSkip}&InterestIds=Y_44160fb4-334d-431d-8a3c-9777dbc8a82d`

      const response = await msnApi.get<MsnNewsResponse>(msnFeedUrl)

      if (response.status !== 200) {
        throw new Error('Error fetching news from MSN API')
      }

      response.data.sections[0].cards.map(async (card) => {
        await db
          .transaction(async (tx) => {
            const existingNews = await tx.query.news.findFirst({
              where: eq(news.newsId, card.id)
            })

            if (existingNews) {
              logger.debug('News already exists in the database', {
                newsId: card.id
              })
              tx.rollback()
              return
            }

            const newsResult = await tx
              .insert(news)
              .values({
                title: card.title,
                category: card.category,
                homepageUrl: card.url,
                newsId: card.id,
                publishedDate: new Date(card.publishedDateTime)
              })
              .returning({ id: news.id })

            await tx.insert(newsProvider).values({
              brandId: card.provider?.id,
              brandName: card.provider?.name,
              newsId: newsResult[0]?.id?.toString(),
              brandLogoUrl: card.provider?.logoUrl,
              brandUrl: ''
            })

            await tx.insert(newsThumbnail).values({
              newsId: newsResult[0].id.toString(),
              originalHeight: card.images[0].height,
              originalWidth: card.images[0].width,
              originalUrl: card.images[0].url
            })
          })
          .catch((error) => {
            logger.error('Error inserting news into database', {
              error,
              card
            })
          })
      })

      const newsResult = await msnNewsServices.getLatestNews(15)

      return newsResult
    } catch (error) {
      logger.error('Error fetching news from MSN API', {
        error
      })
      throw new Error('Error fetching news from MSN API')
    }
  },

  getLatestNews: async (limit = 15) => {
    try {
      const newsResult = await db.query.news.findMany({
        with: {
          provider: true,
          thumbnail: true
        },
        orderBy: [desc(news.publishedDate)],
        limit
      })

      return newsResult
    } catch (error) {
      logger.error('Error fetching news from database', {
        error
      })

      throw new Error('Error fetching news from database')
    }
  }
}
