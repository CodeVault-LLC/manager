export interface MsnSportResponse {
  "@odata.context": string;
  value: MsnSport[];
}

export interface MsnSport {
  schedules: Schedule[];
  specifiedLeague: string;
  recommendedLeagues: RecommendedLeague[];
  videos: any[];
  version: string;
}

export interface Schedule {
  games: Game[];
  league: League;
}

export interface Game {
  startDateTime: string;
  gameState: GameState;
  currentPlayingPeriod?: CurrentPlayingPeriod;
  gameType: GameType;
  week: string;
  startTimeToBeAnnounced: boolean;
  channels: any[];
  participants: Participant[];
  leagueName: LeagueName;
  isLineupAvailable: boolean;
  id: string;
  seasonId: string;
  sport: string;
  secondaryIds: SecondaryId2[];
  navUrls: NavUrls2;
}

export interface GameState {
  gameStatus: string;
  gameClock: GameClock;
  detailedGameStatus: string;
}

export interface GameClock {}

export interface CurrentPlayingPeriod {
  playingPeriodType: string;
}

export interface GameType {
  simpleSeasonPhase: string;
  detailSeasonPhase: string;
}

export interface Participant {
  gameOutcome?: string;
  detailedGameOutcome?: string;
  result?: Result;
  playingPeriodScores: PlayingPeriodScore[];
  team: Team;
  probabilities: Probability[];
  homeAwayStatus: string;
}

export interface Result {
  score: string;
}

export interface PlayingPeriodScore {
  playingPeriod: PlayingPeriod;
  score: string;
}

export interface PlayingPeriod {
  playingPeriodType?: string;
  number: string;
}

export interface Team {
  shortName: ShortName;
  alias: string;
  schoolName: string;
  id: string;
  seasonId: string;
  sport: string;
  sportWithLeague: string;
  name: Name;
  image: Image;
  colors?: Colors;
  secondaryIds: SecondaryId[];
  navUrls: NavUrls;
}

export interface ShortName {
  rawName: string;
}

export interface Name {
  rawName: string;
}

export interface Image {
  id: string;
}

export interface Colors {
  primaryColorHex: string;
  secondaryColorHex?: string;
}

export interface SecondaryId {
  idType: string;
  id: string;
}

export interface NavUrls {
  teamSchedule: string;
}

export interface Probability {
  dataProvider: string;
  winProbability: number;
  tieProbability: number;
}

export interface LeagueName {
  rawName: string;
}

export interface SecondaryId2 {
  idType: string;
  id: string;
}

export interface NavUrls2 {
  gameCenter: string;
}

export interface League {
  seasonYear: number;
  currentSeasonPhase: string;
  currentDetailedSeasonPhase: string;
  seasonStart: string;
  seasonEnd: string;
  isRegularSeasonScheduleAvailable: boolean;
  isRegularSeasonStandingsAvailable: boolean;
  isRegularSeasonStatisticsAvailable: boolean;
  isPlayerStatisticsAvailable: boolean;
  isPlayerImageAvailable: boolean;
  id: string;
  sport: string;
  sportWithLeague: string;
  name: Name2;
  image: Image2;
  colors: Colors2;
  secondaryIds: SecondaryId3[];
  navUrls: NavUrls3;
}

export interface Name2 {
  rawName: string;
}

export interface Image2 {
  id: string;
  secondaryImages: SecondaryImage[];
}

export interface SecondaryImage {
  type: string;
  id: string;
}

export interface Colors2 {
  primaryColorHex: string;
}

export interface SecondaryId3 {
  idType: string;
  id: string;
}

export interface NavUrls3 {
  schedule: string;
}

export interface RecommendedLeague {
  seasonYear: number;
  currentSeasonPhase: string;
  currentDetailedSeasonPhase: string;
  seasonStart: string;
  seasonEnd: string;
  isRegularSeasonScheduleAvailable?: boolean;
  isRegularSeasonStandingsAvailable?: boolean;
  isRegularSeasonStatisticsAvailable?: boolean;
  isPlayerStatisticsAvailable?: boolean;
  isPlayerImageAvailable?: boolean;
  id: string;
  sport: string;
  sportWithLeague: string;
  name: Name3;
  image: Image3;
  colors: Colors3;
  secondaryIds: SecondaryId4[];
  navUrls: NavUrls4;
  isPreseasonScheduleAvailable?: boolean;
  isPreseasonStandingsAvailable?: boolean;
  isPostSeasonStandingsAvailable?: boolean;
  isPreSeasonStatisticsAvailable?: boolean;
  isPostSeasonScheduleAvailable?: boolean;
  isPostSeasonStatisticsAvailable?: boolean;
  isBracketAvailable?: boolean;
  isDraftAvailable?: boolean;
  isOffSeason?: boolean;
}

export interface Name3 {
  rawName: string;
}

export interface Image3 {
  id: string;
  secondaryImages: SecondaryImage2[];
}

export interface SecondaryImage2 {
  type: string;
  id: string;
}

export interface Colors3 {
  primaryColorHex?: string;
}

export interface SecondaryId4 {
  idType: string;
  id: string;
}

export interface NavUrls4 {
  schedule: string;
}

export interface ISport {
  id: string;
  name: string;
  shortName: string;
  image: string;
  color: string;
  secondaryImage: string;
  secondaryColor: string;
  secondaryId: string;
  secondaryIdType: string;
  navUrl: string;
  secondaryNavUrl: string;
  seasonYear: number;
}
