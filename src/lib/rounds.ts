import { Round } from '@/types';
import { ALL_SEED_ROUNDS } from '@/data/seedData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'matchplay_rounds';
const TABLE = 'rounds';

/* ------------------------------------------------------------------ *
 * localStorage fallback (used when Supabase is not configured)
 * ------------------------------------------------------------------ */

function loadStoredRounds(): Round[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Round[]) : [];
  } catch {
    return [];
  }
}

function saveStoredRound(round: Round): void {
  const rounds = loadStoredRounds().filter((r) => r.id !== round.id);
  rounds.push(round);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
}

/* ------------------------------------------------------------------ *
 * Supabase row <-> Round mapping (the rounds table stores scores and
 * conditions as JSONB, so a row maps 1:1 to the app's Round shape)
 * ------------------------------------------------------------------ */

interface RoundRow {
  id: string;
  season_id: string;
  course_id: string | null;
  course_name: string | null;
  played_at: string | null;
  submitted_by: string;
  approved_by: string | null;
  status: Round['status'];
  winner_id: string | null;
  scores: Round['scores'] | null;
  conditions: Round['conditions'] | null;
  submitted_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  is_historical: boolean | null;
}

function rowToRound(row: RoundRow): Round {
  return {
    id: row.id,
    seasonId: row.season_id,
    courseId: row.course_id,
    courseName: row.course_name ?? undefined,
    playedAt: row.played_at,
    submittedBy: row.submitted_by,
    approvedBy: row.approved_by ?? undefined,
    status: row.status,
    winnerId: row.winner_id ?? undefined,
    scores: row.scores ?? [],
    conditions: row.conditions ?? undefined,
    submittedAt: row.submitted_at,
    approvedAt: row.approved_at ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isHistorical: row.is_historical ?? undefined,
  };
}

function roundToRow(round: Round): RoundRow {
  return {
    id: round.id,
    season_id: round.seasonId,
    course_id: round.courseId,
    course_name: round.courseName ?? null,
    played_at: round.playedAt,
    submitted_by: round.submittedBy,
    approved_by: round.approvedBy ?? null,
    status: round.status,
    winner_id: round.winnerId ?? null,
    scores: round.scores ?? [],
    conditions: round.conditions ?? {},
    submitted_at: round.submittedAt,
    approved_at: round.approvedAt ?? null,
    rejection_reason: round.rejectionReason ?? null,
    created_at: round.createdAt,
    updated_at: round.updatedAt,
    is_historical: round.isHistorical ?? false,
  };
}

/* ------------------------------------------------------------------ *
 * Merge helpers
 * ------------------------------------------------------------------ */

/**
 * Merge seed rounds with persisted rounds. Persisted rounds override seed rounds
 * with the same id (that's how edits to the seeded 2026 rounds take effect), and
 * any brand-new rounds are appended.
 */
export function mergeRounds(seed: Round[], stored: Round[]): Round[] {
  const byId = new Map<string, Round>();
  for (const round of seed) byId.set(round.id, round);
  for (const round of stored) byId.set(round.id, round);
  return [...byId.values()];
}

/**
 * Next sequential id for a season, computed from an already-loaded set of rounds
 * so newly-created rounds never collide with seed or persisted rounds.
 */
export function nextRoundId(seasonId: string, rounds: Round[]): string {
  const prefix = `${seasonId}-round-`;
  const highest = rounds
    .filter((r) => r.id.startsWith(prefix))
    .reduce((max, r) => {
      const n = parseInt(r.id.slice(prefix.length), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
  return `${prefix}${String(highest + 1).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ *
 * Public async data API (Supabase when configured, localStorage otherwise)
 * ------------------------------------------------------------------ */

/** Fetch all rounds, merged with the provided seed rounds. */
export async function fetchRounds(seed: Round[]): Promise<Round[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) throw error;
    const remote = ((data ?? []) as RoundRow[]).map(rowToRound);
    return mergeRounds(seed, remote);
  }
  return mergeRounds(seed, loadStoredRounds());
}

/** Fetch a single round by id, falling back to the seed data. */
export async function fetchRound(id: string): Promise<Round | undefined> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (data) return rowToRound(data as RoundRow);
    return ALL_SEED_ROUNDS.find((r) => r.id === id);
  }
  const stored = loadStoredRounds().find((r) => r.id === id);
  return stored ?? ALL_SEED_ROUNDS.find((r) => r.id === id);
}

/** Insert or update a round. */
export async function saveRound(round: Round): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from(TABLE)
      .upsert(roundToRow(round), { onConflict: 'id' });
    if (error) throw error;
    return;
  }
  saveStoredRound(round);
}
