import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sportsLeagues } from './sport-leagues.schema'
import { sportGameParticipants } from './sport-game-participants.schema'

export const sportsTeams = sqliteTable('sports_teams', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  shortName: text('short_name').notNull(),
  fullName: text('full_name').notNull(),
  schoolName: text('school_name').notNull(),
  leagueId: integer('league_id')
    .notNull()
    .references(() => sportsLeagues.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
})

export const sportsTeamsRelations = relations(sportsTeams, ({ one, many }) => ({
  league: one(sportsLeagues, {
    fields: [sportsTeams.leagueId],
    references: [sportsLeagues.id]
  }),
  gameParticipants: many(sportGameParticipants)
}))
