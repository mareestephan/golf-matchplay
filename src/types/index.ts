// Database Types
export type RoundStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type HazardType = 'bunker' | 'water' | 'ob' | 'penalty';

export type UserRole = 'admin' | 'player';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  targetWins: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  externalId: string;
  name: string;
  clubName: string;
  city: string;
  province: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  holes: number;
  par: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseHole {
  id: string;
  courseId: string;
  holeNumber: number;
  par: number;
  strokeIndex: number;
  yardage: number | null;
  handicap: number | null;
}

export interface HoleScore {
  id: string;
  holeNumber: number;
  playerId: string;
  score: number;
  putts?: number;
  fairway?: 'hit' | 'miss' | 'na';
  gir?: boolean;
  hazards?: HazardType[];
  penaltyStrokes?: number;
  notes?: string;
}

export interface RoundConditions {
  weather?: 'dry' | 'raining';
  windSpeed?: 'calm' | 'light' | 'moderate' | 'strong';
  fairwaysCondition?: 'hard' | 'medium' | 'soft';
  greensSpeed?: 'fast' | 'medium' | 'slow';
  grainAffected?: boolean;
  notes?: string;
}

export interface Round {
  id: string;
  seasonId: string;
  courseId: string | null;
  courseName?: string | null;
  playedAt: string | null;
  submittedBy: string;
  approvedBy?: string;
  status: RoundStatus;
  winnerId?: string;
  scores: HoleScore[];
  conditions?: RoundConditions;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  isHistorical?: boolean;
}

export interface Club {
  id: string;
  playerId: string;
  category: string;
  brand: string;
  model: string;
  loft?: string;
  shaft?: string;
  flex?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AppContextType {
  auth: AuthState;
  currentSeason: Season | null;
  standings: {
    [userId: string]: number;
  };
  notifications: Notification[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'ROUND_SUBMITTED' | 'ROUND_APPROVED' | 'ROUND_REJECTED';
  roundId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface StandingsData {
  stephanWins: number;
  paulWins: number;
  ties: number;
}

export interface PlayerStats {
  playerId: string;
  seasonId: string;
  roundsPlayed: number;
  roundsWon: number;
  roundsLost: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averagePutts: number;
  girPercentage: number;
  fairwayPercentage: number;
}
