'use client';

import { useMemo } from 'react';
import { Minus, Target } from 'lucide-react';
import {
  HISTORICAL_ROUNDS_2025_2026,
  HISTORICAL_ROUNDS_2026,
} from '@/data/seedData';
import {
  calculateAverageScore,
  getBestScore,
  calculateAveragePutts,
  calculateGirPercentage,
  calculateFairwayPercentage,
  getHeadToHeadRecord,
  calculateSeasonStandings,
} from '@/lib/calculations';
import { Badge } from '@/components/ui/badge';
import PageHeading from '@/components/layout/PageHeading';
import { useRounds } from '@/hooks/useRounds';
import { cn } from '@/lib/utils';

const PLAYERS = [
  {
    id: 'stephan',
    name: 'Stephan Maree',
    initials: 'SM',
    role: 'Admin',
    accent: 'teal' as const,
  },
  {
    id: 'paul',
    name: 'Paul Du Plessis',
    initials: 'PD',
    role: 'Player',
    accent: 'terracotta' as const,
  },
];

export default function PlayersPage() {
  const rounds2026 = useRounds(HISTORICAL_ROUNDS_2026);
  const allRounds = useMemo(
    () => [...HISTORICAL_ROUNDS_2025_2026, ...rounds2026],
    [rounds2026]
  );

  const season = useMemo(
    () =>
      calculateSeasonStandings(
        rounds2026.filter((r) => r.status === 'APPROVED')
      ),
    [rounds2026]
  );

  const h2h = useMemo(
    () => getHeadToHeadRecord(allRounds, 'stephan', 'paul'),
    [allRounds]
  );

  const players = useMemo(
    () =>
      PLAYERS.map((p) => ({
        ...p,
        seasonWins:
          p.id === 'stephan' ? season.stephanWins : season.paulWins,
        allTimeWins:
          p.id === 'stephan' ? h2h.player1Wins : h2h.player2Wins,
        stats: [
          {
            label: 'Avg Score',
            value: fmt(calculateAverageScore(allRounds, p.id), (v) => v.toFixed(1)),
          },
          {
            label: 'Best Round',
            value: fmt(getBestScore(allRounds, p.id) ?? 0),
          },
          {
            label: 'Avg Putts',
            value: fmt(calculateAveragePutts(allRounds, p.id), (v) => v.toFixed(1)),
          },
          {
            label: 'GIR',
            value: fmt(calculateGirPercentage(allRounds, p.id), (v) => `${v.toFixed(0)}%`),
          },
          {
            label: 'Fairways',
            value: fmt(calculateFairwayPercentage(allRounds, p.id), (v) => `${v.toFixed(0)}%`),
          },
          { label: 'Rounds', value: String(allRounds.length) },
        ],
      })),
    [allRounds, season, h2h]
  );

  return (
    <div>
      <PageHeading
        index="04"
        eyebrow="The Contenders"
        title="Players"
        description="Head-to-head across every recorded season."
      />

      {/* Head to head */}
      <section className="mb-10 grid grid-cols-[1fr_auto_1fr] items-center gap-6 border border-border bg-card px-6 py-8 lg:px-12">
        <div className="text-right">
          <p className="eyebrow text-muted-foreground">Stephan</p>
          <p className="mt-2 font-display text-5xl font-bold tabular-nums text-teal lg:text-6xl">
            {h2h.player1Wins}
          </p>
        </div>
        <div className="text-center">
          <p className="eyebrow text-muted-foreground">All-time</p>
          <p className="mt-2 font-display text-2xl text-muted-foreground">vs</p>
        </div>
        <div>
          <p className="eyebrow text-muted-foreground">Paul</p>
          <p className="mt-2 font-display text-5xl font-bold tabular-nums text-terracotta lg:text-6xl">
            {h2h.player2Wins}
          </p>
        </div>
      </section>

      {/* Player cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {players.map((player) => (
          <section key={player.id} className="border border-border bg-card">
            <div className="flex items-center gap-4 border-b border-border p-6">
              <span
                className={cn(
                  'grid size-14 shrink-0 place-items-center font-display text-lg font-bold text-paper',
                  player.accent === 'teal' ? 'bg-teal' : 'bg-terracotta'
                )}
              >
                {player.initials}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
                  {player.name}
                </h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant="outline">{player.role}</Badge>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {player.seasonWins} wins · 2026
                  </span>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3">
              {player.stats.map((stat) => (
                <div key={stat.label} className="p-5">
                  <dt className="eyebrow text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-2 font-display text-2xl font-bold tabular-nums text-ink">
                    {stat.value === null ? (
                      <Minus className="size-5 text-muted-foreground/50" />
                    ) : (
                      stat.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="flex items-center gap-2 border-t border-border px-5 py-4 font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
              <Target className="size-3.5" />
              Detailed stats populate once hole-by-hole scorecards are recorded.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

function fmt(value: number, format?: (v: number) => string): string | null {
  if (!value || value <= 0) return null;
  return format ? format(value) : String(value);
}
