import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sportsTeams } from './sport-teams.schema'
import { sportGames } from './sport-games.schema'

export const sportsLeagues = sqliteTable('sports_leagues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),

  lastUpdated: integer({ mode: 'timestamp' }).defaultNow()
})

export const sportsLeaguesRelations = relations(sportsLeagues, ({ many }) => ({
  teams: many(sportsTeams),
  games: many(sportGames)
}))
