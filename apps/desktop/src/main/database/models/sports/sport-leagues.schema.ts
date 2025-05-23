import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { sportGames } from './sport-games.schema'
import { sportsTeams } from './sport-teams.schema'

export const sportsLeagues = sqliteTable('sports_leagues', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),

  lastUpdated: integer({ mode: 'timestamp' }).defaultNow()
})

export const sportsLeaguesRelations = relations(sportsLeagues, ({ many }) => ({
  teams: many(sportsTeams),
  games: many(sportGames)
}))
