import { Round, HoleScore, StandingsData } from '@/types';

const STEPHAN_ID = 'stephan';
const PAUL_ID = 'paul';

/**
 * Calculate total score for a player in a round
 */
export function calculatePlayerTotal(scores: HoleScore[], playerId: string): number {
  return scores
    .filter((s) => s.playerId === playerId)
    .reduce((total, score) => total + score.score, 0);
}

/**
 * Determine the winner of a round based on scores
 */
export function calculateRoundWinner(round: Round): string | null {
  if (!round.scores || round.scores.length === 0) return null;

  const stephanTotal = calculatePlayerTotal(round.scores, STEPHAN_ID);
  const paulTotal = calculatePlayerTotal(round.scores, PAUL_ID);

  // If either player has no scores, can't determine winner
  if (stephanTotal === 0 || paulTotal === 0) return null;

  if (stephanTotal < paulTotal) return STEPHAN_ID;
  if (paulTotal < stephanTotal) return PAUL_ID;

  return null; // Tie
}

/**
 * Calculate season standings from approved rounds
 */
export function calculateSeasonStandings(
  approvedRounds: Round[]
): StandingsData {
  let stephanWins = 0;
  let paulWins = 0;
  let ties = 0;

  approvedRounds.forEach((round) => {
    const winner = round.winnerId || calculateRoundWinner(round);

    if (winner === STEPHAN_ID) {
      stephanWins++;
    } else if (winner === PAUL_ID) {
      paulWins++;
    } else if (winner === null) {
      ties++;
    }
  });

  return {
    stephanWins,
    paulWins,
    ties,
  };
}

/**
 * Calculate average score for a player across rounds
 */
export function calculateAverageScore(
  rounds: Round[],
  playerId: string
): number {
  if (rounds.length === 0) return 0;

  const roundsWithScores = rounds.filter((r) => r.scores && r.scores.length > 0);
  if (roundsWithScores.length === 0) return 0;

  const totalScore = roundsWithScores.reduce((total, round) => {
    return total + calculatePlayerTotal(round.scores, playerId);
  }, 0);

  return totalScore / roundsWithScores.length;
}

/**
 * Calculate average putts for a player
 */
export function calculateAveragePutts(
  rounds: Round[],
  playerId: string
): number {
  const playerScores = rounds.flatMap((r) =>
    r.scores.filter((s) => s.playerId === playerId)
  );

  const scoresWithPutts = playerScores.filter((s) => s.putts !== undefined);

  if (scoresWithPutts.length === 0) return 0;

  const totalPutts = scoresWithPutts.reduce((total, s) => total + (s.putts || 0), 0);
  return totalPutts / scoresWithPutts.length;
}

/**
 * Calculate GIR percentage
 */
export function calculateGirPercentage(
  rounds: Round[],
  playerId: string
): number {
  const playerScores = rounds.flatMap((r) =>
    r.scores.filter((s) => s.playerId === playerId)
  );

  const scoresWithGir = playerScores.filter((s) => s.gir !== undefined);

  if (scoresWithGir.length === 0) return 0;

  const girCount = scoresWithGir.filter((s) => s.gir).length;
  return (girCount / scoresWithGir.length) * 100;
}

/**
 * Calculate fairway percentage
 */
export function calculateFairwayPercentage(
  rounds: Round[],
  playerId: string
): number {
  const playerScores = rounds.flatMap((r) =>
    r.scores.filter((s) => s.playerId === playerId)
  );

  const fairwayScores = playerScores.filter((s) => s.fairway !== undefined && s.fairway !== 'na');

  if (fairwayScores.length === 0) return 0;

  const hitCount = fairwayScores.filter((s) => s.fairway === 'hit').length;
  return (hitCount / fairwayScores.length) * 100;
}

/**
 * Get best score for a player
 */
export function getBestScore(rounds: Round[], playerId: string): number | null {
  const roundsWithScores = rounds.filter((r) => r.scores && r.scores.length > 0);
  if (roundsWithScores.length === 0) return null;

  const scores = roundsWithScores.map((r) => calculatePlayerTotal(r.scores, playerId));
  return Math.min(...scores);
}

/**
 * Get worst score for a player
 */
export function getWorstScore(rounds: Round[], playerId: string): number | null {
  const roundsWithScores = rounds.filter((r) => r.scores && r.scores.length > 0);
  if (roundsWithScores.length === 0) return null;

  const scores = roundsWithScores.map((r) => calculatePlayerTotal(r.scores, playerId));
  return Math.max(...scores);
}

/**
 * Calculate score relative to par
 */
export function calculateRelativeToPar(
  score: number,
  par: number
): number {
  return score - par;
}

/**
 * Get current winning streak
 */
export function getCurrentWinningStreak(
  approvedRounds: Round[],
  playerId: string
): number {
  let streak = 0;

  for (let i = approvedRounds.length - 1; i >= 0; i--) {
    const winner = approvedRounds[i].winnerId || calculateRoundWinner(approvedRounds[i]);

    if (winner === playerId) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get head-to-head record between two players
 */
export function getHeadToHeadRecord(
  approvedRounds: Round[],
  player1Id: string,
  player2Id: string
): { player1Wins: number; player2Wins: number } {
  let player1Wins = 0;
  let player2Wins = 0;

  approvedRounds.forEach((round) => {
    const winner = round.winnerId || calculateRoundWinner(round);

    if (winner === player1Id) {
      player1Wins++;
    } else if (winner === player2Id) {
      player2Wins++;
    }
  });

  return { player1Wins, player2Wins };
}
