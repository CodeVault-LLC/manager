export interface ISport {
  id: string;
  externalId: string;
  startDateTime: string;
  status: string;
  week: string;
  seasonPhase: string;
  sport: string;
  leagueId: string;
  participants: Participant[];
  league: League;
}

export interface Participant {
  id: string;
  gameId: string;
  teamId: string;
  homeAway: string;
  winProbability: number;
  tieProbability: number;
  team: Team;
}

export interface Team {
  id: string;
  shortName: string;
  fullName: string;
  schoolName: string;
  leagueId: string;
}

export interface League {
  id: string;
  name: string;
  lastUpdated: string;
}
