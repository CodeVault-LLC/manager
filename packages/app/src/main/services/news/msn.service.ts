import { MsnNewsResponse } from '@shared/types/msn/msn-news'
import axios from 'axios'
import { db } from '../../database/data-source'
import { news, newsProvider, newsThumbnail } from '../../database/models/schema'
import { desc } from 'drizzle-orm'

const msnApi = axios.create({
  baseURL: 'https://api.msn.com/news/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

export const msnServices = {
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
            const newsResult = await tx
              .insert(news)
              .values({
                title: card.title,
                category: card.category,
                homepageUrl: card.url,
                newsId: card.id,
                publishedDate: new Date(card.publishedDateTime),
                summary: card.abstract
              })
              .returning({ id: news.id })

            console.log('newsResult', newsResult)

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
              originalUrl: card.images[0].url,
              caption: card.images[0].caption
            })
          })
          .catch((error) => {
            console.error('Error inserting news:', error)
          })
      })

      const newsResult = await db.query.news.findMany({
        with: {
          provider: true,
          thumbnail: true
        },
        orderBy: [desc(news.publishedDate)],
        limit: 15
      })

      return newsResult
    } catch (error) {
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
      throw new Error('Error fetching news from database')
    }
  }
}
