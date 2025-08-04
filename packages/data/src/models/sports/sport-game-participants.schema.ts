import { relations } from 'drizzle-orm'
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { sportGames } from './sport-games.schema'
import { sportsTeams } from './sport-teams.schema'

export const sportGameParticipants = sqliteTable('sports_game_participants', {
  id: text('id').primaryKey().notNull(),
  gameId: text('game_id')
    .notNull()
    .references(() => sportGames.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  teamId: text('team_id')
    .notNull()
    .references(() => sportsTeams.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  homeAway: text('home_away').notNull(), // 'Home' or 'Away'
  winProbability: real('win_probability'),
  tieProbability: real('tie_probability')
})

export const sportGameParticipantsRelations = relations(
  sportGameParticipants,
  ({ one }) => ({
    game: one(sportGames, {
      fields: [sportGameParticipants.gameId],
      references: [sportGames.id]
    }),
    team: one(sportsTeams, {
      fields: [sportGameParticipants.teamId],
      references: [sportsTeams.id]
    })
  })
)
