import axios from 'axios'
import { eq, desc, and } from 'drizzle-orm'
import { db } from '@main/database/data-source'
import {
  sportsLeagues,
  sportsTeams,
  sportGames,
  sportGameParticipants
} from '@main/database/models/schema'
import { MsnSportResponse } from '@manager/common/src'

const msnApi = axios.create({
  baseURL: 'https://api.msn.com/sports/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

msnApi.interceptors.response.use(
  (response) => {
    log.debug('MSN API response', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    })
    return response
  },
  (error) => {
    log.error('Error fetching data from MSN API', error.message)
    return Promise.reject(error)
  }
)

export const msnSportServices = {
  requestLatestGames: async ({ sport, league }) => {
    try {
      const defaultApiKey = 'kO1dI4ptCTTylLkPL1ZTHYP8JhLKb8mRDoA5yotmNJ'
      const version = '1.0'
      const market = 'nb-no'
      const msnFeedUrl = `livearoundtheleague?apikey=${defaultApiKey}&version=${version}&cm=${market}&tzoffset=2&activityId=0446D2A9-2F4E-4216-9864-8AB8ED33A0C9&it=edgeid&user=m-16C9BD47FDB46E090D40A894FC416F87&scn=APP_ANON&datetime=2025-06-05T16:44:39&id=Soccer_SpainLaLiga&sport=${sport}`

      if (league) {
        //
      }

      const response = await msnApi.get<MsnSportResponse>(msnFeedUrl)

      if (response.status !== 200) {
        throw new Error('Invalid response from MSN API')
      }

      const schedules = response.data.value[0].schedules

      for (const schedule of schedules) {
        const league = schedule.league

        await db.transaction(async (tx) => {
          await tx
            .insert(sportsLeagues)
            .values({
              id: league.id,
              name: league.name.rawName
            })
            .onConflictDoNothing()

          for (const game of schedule.games) {
            const existingGame = await tx.query.sportGames.findFirst({
              where: eq(sportGames.externalId, game.id)
            })

            if (existingGame) continue

            for (const participant of game.participants) {
              const team = participant.team
              await tx
                .insert(sportsTeams)
                .values({
                  id: team.id,
                  shortName: team.shortName.rawName,
                  fullName: team.name.rawName,
                  schoolName: team.schoolName,
                  leagueId: league.id
                })
                .onConflictDoNothing()
                .returning({ id: sportsTeams.id })
            }

            const gameRecord = await tx
              .insert(sportGames)
              .values({
                id: `${league.id}-${game.id}`,
                startDateTime: game.startDateTime,
                seasonPhase: game.gameType.simpleSeasonPhase,
                externalId: game.id,
                leagueId: league.id,
                sport: game.sport,
                status: game.gameState.gameStatus,
                week: game.week
              })
              .returning({ id: sportGames.id })

            for (const participant of game.participants) {
              const teamId = participant.team.id
              await tx.insert(sportGameParticipants).values({
                gameId: gameRecord[0].id,
                teamId,
                id: `${gameRecord[0].id}-${teamId}`,
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
      log.error('Error processing games from MSN API', error)
      throw new Error('Failed to process MSN sports data')
    }
  },

  getLatestGames: async ({ limit, offset, sport, league }) => {
    try {
      const games = await db.query.sportGames.findMany({
        orderBy: [desc(sportGames.startDateTime)],
        limit,
        offset,
        where: and(
          eq(sportGames.sport, sport),
          eq(sportGames.leagueId, league)
        ),
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
      log.error('Error fetching games from database', {
        error
      })
      throw new Error('Failed to fetch games from database')
    }
  }
}
