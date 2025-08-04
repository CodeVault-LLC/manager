import { relations } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { sportGameParticipants } from './sport-game-participants.schema'
import { sportsLeagues } from './sport-leagues.schema'

export const sportsTeams = sqliteTable('sports_teams', {
  id: text('id').primaryKey().notNull(),
  shortName: text('short_name').notNull(),
  fullName: text('full_name').notNull(),
  schoolName: text('school_name').notNull(),
  leagueId: text('league_id')
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
