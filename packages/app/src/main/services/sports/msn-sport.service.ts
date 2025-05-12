import { MsnSportResponse } from '@shared/types/msn/msn-sport'
import axios from 'axios'
import { db } from '@main/database/data-source'
import {
  sportsLeagues,
  sportsTeams,
  sportGames,
  sportGameParticipants
} from '@main/database/models/schema'
import { eq, desc } from 'drizzle-orm'
import logger from '@main/logger'

const msnApi = axios.create({
  baseURL: 'https://api.msn.com/sports/',
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
    logger.error('Error fetching data from MSN API', {
      error: error.message
    })
    return Promise.reject(error)
  }
)

export const msnSportServices = {
  requestLatestGames: async () => {
    try {
      const defaultApiKey = 'kO1dI4ptCTTylLkPL1ZTHYP8JhLKb8mRDoA5yotmNJ'
      const version = '1.0'
      const market = 'nb-no'

      const msnFeedUrl = `livearoundtheleague?apikey=${defaultApiKey}&version=${version}&cm=${market}&tzoffset=2&activityId=682213D1-843C-44C9-B41F-D3710312DEEF&datetime=2025-05-02T20:00:13&id=Soccer_EnglandPremierLeague&sport=Soccer`

      const response = await msnApi.get<MsnSportResponse>(msnFeedUrl)

      if (response.status !== 200) {
        throw new Error('Invalid response from MSN API')
      }

      const schedules = response.data.value[0].schedules

      for (const schedule of schedules) {
        const league = schedule.league

        await db.transaction(async (tx) => {
          const [_] = await tx
            .insert(sportsLeagues)
            .values({
              id: parseInt(league.id),
              name: league.name.rawName
            })
            .onConflictDoNothing()
            .returning({ id: sportsLeagues.id })

          for (const game of schedule.games) {
            const existingGame = await tx.query.sportGames.findFirst({
              where: eq(sportGames.externalId, game.id)
            })

            if (existingGame) continue

            for (const participant of game.participants) {
              const team = participant.team
              const [_] = await tx
                .insert(sportsTeams)
                .values({
                  id: parseInt(team.id),
                  shortName: team.shortName.rawName,
                  fullName: team.name.rawName,
                  schoolName: team.schoolName,
                  leagueId: parseInt(league.id)
                })
                .onConflictDoNothing()
                .returning({ id: sportsTeams.id })
            }

            const gameRecord = await tx
              .insert(sportGames)
              .values({
                startDateTime: game.startDateTime,
                seasonPhase: game.gameType.simpleSeasonPhase,
                externalId: game.id,
                leagueId: parseInt(league.id),
                sport: game.sport,
                status: game.gameState.gameStatus,
                week: game.week
              })
              .returning({ id: sportGames.id })

            for (const participant of game.participants) {
              const teamId = parseInt(participant.team.id)
              await tx.insert(sportGameParticipants).values({
                gameId: gameRecord[0].id,
                teamId,
                homeAway: participant.homeAwayStatus,
                tieProbability: participant.probabilities[0].tieProbability,
                winProbability: participant.probabilities[0].winProbability
              })
            }
          }
        })
      }

      return { success: true }
    } catch (error) {
      logger.error('Error processing games from MSN API', {
        error
      })
      throw new Error('Failed to process MSN sports data')
    }
  },

  getLatestGames: async (limit = 15) => {
    try {
      const games = await db.query.sportGames.findMany({
        orderBy: [desc(sportGames.startDateTime)],
        limit,
        with: {
          participants: {
            with: {
              team: true
            }
          },
          league: true
        }
      })

      return games
    } catch (error) {
      logger.error('Error fetching games from database', {
        error
      })
      throw new Error('Failed to fetch games from database')
    }
  }
}
