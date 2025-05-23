import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sportsLeagues } from './sport-leagues.schema'
import { sportGameParticipants } from './sport-game-participants.schema'

export const sportGames = sqliteTable('sports_games', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  externalId: text('external_id').notNull(), // For tracking SportRadar/GameCenter ID
  startDateTime: text('start_date_time').notNull(), // Store as ISO 8601 string
  status: text('status').notNull(), // e.g., PreGame, Live, Final
  week: text('week'),
  seasonPhase: text('season_phase'),
  sport: text('sport').notNull(), // e.g., Football, Basketball, etc.
  leagueId: integer('league_id')
    .notNull()
    .references(() => sportsLeagues.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
})

export const gamesRelations = relations(sportGames, ({ one, many }) => ({
  league: one(sportsLeagues, {
    fields: [sportGames.leagueId],
    references: [sportsLeagues.id]
  }),
  participants: many(sportGameParticipants)
}))
