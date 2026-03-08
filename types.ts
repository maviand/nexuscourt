export interface PlayerStats {
  // Overall
  rating: number; 
  
  // Finishing
  layup: number;
  dunk: number;
  closeShot: number;

  // Shooting
  midRange: number;
  threePoint: number;
  freeThrow: number;

  // Playmaking
  passAccuracy: number;
  ballHandle: number;
  vision: number;

  // Defense
  interiorDefense: number;
  perimeterDefense: number;
  steal: number;
  block: number;
  lateralQuickness: number;
  helpDefense: number;
  onBallDefense: number;

  // Rebounding
  offRebound: number;
  defRebound: number;

  // Physicals / Mental
  speed: number;
  acceleration: number;
  agility: number;
  vertical: number;
  strength: number;
  stamina: number;
  durability: number;
  iq: number;
}

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Hall of Fame';

export interface Badge {
  name: string;
  tier: BadgeTier;
  description: string;
  category: 'Finishing' | 'Shooting' | 'Playmaking' | 'Defense';
}

export interface TeammateStats {
  name: string;
  position: string;
  ppg: number;
  rpg: number;
  apg: number;
  isStar: boolean;
  archetype?: string; // e.g., "Rim Protector"
  morale?: 'Happy' | 'Content' | 'Frustrated';
  // New Impact Fields
  seasonGrowth?: string; // e.g. "+2.4 PPG" or "-1.2 EFF"
  synergyGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  synergyNote?: string; // e.g. "Thrives on your kick-out passes"
}

export interface ConferenceStandings {
  conference: 'East' | 'West';
  teams: { name: string; wins: number; losses: number; seed: number; gb: number }[];
}

export interface PlayoffSeries {
    round: 'First Round' | 'Conf. Semis' | 'Conf. Finals' | 'NBA Finals';
    winner: string;
    loser: string;
    score: string; // "4-2"
}

export interface PlayoffBracketSummary {
  champion: string;
  runnerUp: string;
  finalsMvp: string;
  series: PlayoffSeries[];
}

export interface CoachStats {
    offense: number;
    defense: number;
    playerDevelopment: number;
    gameManagement: number;
}

export interface CoachingStrategy {
  offensiveSystem: 'Seven Seconds or Less' | 'Triangle' | 'Grit & Grind' | 'Heliocentric' | 'Motion' | 'Pace and Space';
  defensiveScheme: 'Switch Everything' | 'Drop Coverage' | 'Full Court Press' | 'Zone';
  usageRate: 'Role Player' | 'Secondary Star' | 'The System' | 'Sixth Man';
  minutesPerGame: number;
}

export interface Coach {
  name: string;
  offensiveSystem: CoachingStrategy['offensiveSystem'];
  defensiveScheme: CoachingStrategy['defensiveScheme'];
  quality: 'Legendary' | 'Elite' | 'Average' | 'Mediocre' | 'Hot Seat';
  attributes: CoachStats;
  xp: number;
  usageRate?: CoachingStrategy['usageRate'];
  minutesPerGame?: number;
}

export interface PlayerProfile {
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  height: string;
  weight: string;
  archetype: string;
  stats: PlayerStats;
  badges: Badge[];
  potential: number; // 0-99
  bio: string;
  xp: number; // Experience points for upgrades
  draftTradeRequest?: string; // Team name if requested
  injuriesEnabled?: boolean;
  trainingFocus?: TrainingFocus;
  era?: EraContext;
  careerStats?: {
    totalPoints: number;
    totalRebounds: number;
    totalAssists: number;
    championships: number;
    mvps: number;
    legacyScore?: number;
    awards?: string[];
  };
}

export interface AdvancedStats {
  per: number;
  tsPct: number;
  usgPct: number;
  ortg: number;
  drtg: number;
  vorp: number;
  winShares: number;
}

export interface LeagueContext {
    leagueLeaders: { category: string, player: string, value: string }[];
    headlines: string[];
    rivalryUpdate: string; // e.g., "The Lakers are dominating the West"
}

export interface DraftProspect {
  name: string;
  position: string;
  archetype: string;
  potential: number;
  height: string;
  comparison: string;
}

export interface SeasonStats {
  year: number;
  team: string;
  age: number;
  
  // Detailed Regular Season Stats
  gamesPlayed: number;
  minutes: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePtPct: number;
  ftPct: number;
  turnovers: number;
  plusMinus: number;
  
  // Advanced Stats
  advanced: AdvancedStats;

  // Context
  teamRecord: string; // "50-32"
  seed: number;
  standings: ConferenceStandings[]; // East and West top 8
  leagueContext: LeagueContext;
  draftClass?: DraftProspect[];
  
  // Roster Context
  teammates: TeammateStats[];
  headCoach?: Coach;
  teamChemistry: number; // 0-100

  // Playoffs
  playoffStats: {
    roundReached: string;
    seriesRecord: string;
    ppg: number;
    rpg: number;
    apg: number;
    bracket: PlayoffBracketSummary;
  };

  // Snapshot
  ratingsSnapshot: PlayerStats;
  badgesSnapshot: Badge[];
  
  // Physical Condition
  fatigue: number; // 0-100
  burnoutRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  
  // Narrative
  highlights: string[]; // Specific plays e.g. "Poster dunk on Embiid"
  awards: string[];
  championship: boolean;
  allStar: boolean;
  narrative: string;
  tradeRequestGranted?: boolean; // If a trade happened mid-season
  gmSentiment?: string; // "The GM views you as untouchable" or "The GM is open to offers"
  xpGained: number;
  
  // Impact
  onCourtImpact: string; // Narrative about team performance with player
  offCourtImpact: string; // Narrative about team performance WITHOUT player
}

export interface CareerSimulation {
  summary: string;
  accolades: {
    titles: number;
    mvps: number;
    allStars: number;
    hallOfFameChance: number;
  };
  seasons: SeasonStats[];
  legacyScore: number;
}

export interface EraContext {
  year: number;
  eraName: string;
  description: string;
  difficultyModifier: number;
}

export type EntryMethod = 'Draft' | 'Specific Team';
export type TrainingFocus = 'Balanced' | 'Shooting' | 'Finishing' | 'Playmaking' | 'Defense' | 'Physicals' | 'Recovery';

export const NBA_TEAMS = [
  "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers", "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks", "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards", "Seattle SuperSonics"
];