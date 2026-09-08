'use client';

import { useMemo, useState } from 'react';
import {
  Award,
  CalendarDays,
  Crosshair,
  Flag,
  Flame,
  Gauge,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { Round } from '@/types';
import {
  calculateAverageScore,
  getBestScore,
  getWorstScore,
  calculateAveragePutts,
  calculateGirPercentage,
  calculateFairwayPercentage,
  getCurrentWinningStreak,
} from '@/lib/calculations';
import PageHeading from '@/components/layout/PageHeading';
import { useRounds } from '@/hooks/useRounds';
import { cn } from '@/lib/utils';

interface StatsPageProps {
  rounds: Round[];
}

const PLAYERS = [
  { id: 'stephan', name: 'Stephan', full: 'Stephan Maree' },
  { id: 'paul', name: 'Paul', full: 'Paul Du Plessis' },
] as const;

type PlayerId = (typeof PLAYERS)[number]['id'];

export default function StatsPage({ rounds: seedRounds }: StatsPageProps) {
  const rounds = useRounds(seedRounds);
  const [active, setActive] = useState<PlayerId>('stephan');
  const player = PLAYERS.find((p) => p.id === active)!;

  const record = useMemo(() => {
    const wins = rounds.filter((r) => r.winnerId === active).length;
    const losses = rounds.filter(
      (r) => r.winnerId && r.winnerId !== active
    ).length;
    const played = wins + losses;
    const winPct = played > 0 ? Math.round((wins / played) * 100) : 0;
    const form = [...rounds]
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      .slice(0, 8)
      .reverse()
      .map((r) => (r.winnerId === active ? 'W' : r.winnerId ? 'L' : '·'));
    return { wins, losses, played, winPct, form };
  }, [rounds, active]);

  const stats = useMemo(
    () => ({
      avgScore: calculateAverageScore(rounds, active),
      bestScore: getBestScore(rounds, active),
      worstScore: getWorstScore(rounds, active),
      avgPutts: calculateAveragePutts(rounds, active),
      girPct: calculateGirPercentage(rounds, active),
      fairwayPct: calculateFairwayPercentage(rounds, active),
      streak: getCurrentWinningStreak(rounds, active),
    }),
    [rounds, active]
  );

  const cards: Array<{
    label: string;
    value: string | null;
    hint?: string;
    icon: LucideIcon;
  }> = [
    { label: 'Rounds', value: String(record.played), icon: CalendarDays },
    { label: 'Win Streak', value: String(stats.streak), icon: Flame },
    {
      label: 'Avg Score',
      value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : null,
      hint: 'Lower is better',
      icon: Gauge,
    },
    {
      label: 'Best Round',
      value: stats.bestScore ? String(stats.bestScore) : null,
      icon: Award,
    },
    {
      label: 'Avg Putts',
      value: stats.avgPutts > 0 ? stats.avgPutts.toFixed(1) : null,
      hint: 'Per round',
      icon: Target,
    },
    {
      label: 'GIR',
      value: stats.girPct > 0 ? `${stats.girPct.toFixed(0)}%` : null,
      hint: 'Greens in reg.',
      icon: Flag,
    },
    {
      label: 'Fairways',
      value: stats.fairwayPct > 0 ? `${stats.fairwayPct.toFixed(0)}%` : null,
      hint: 'Off the tee',
      icon: Crosshair,
    },
    {
      label: 'Win Rate',
      value: record.played > 0 ? `${record.winPct}%` : null,
      icon: Trophy,
    },
  ];

  return (
    <div>
      <PageHeading
        index="05"
        eyebrow="Analytics"
        title="Statistics"
        description="Match record and performance breakdown for each player."
        action={
          <div className="inline-flex border border-ink">
            {PLAYERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={cn(
                  'px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors',
                  active === p.id
                    ? 'bg-ink text-paper'
                    : 'bg-transparent text-ink hover:bg-muted'
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        }
      />

      {/* Record panel */}
      <section className="mb-8 grid gap-px overflow-hidden border border-teal bg-teal text-paper md:grid-cols-[1.4fr_1fr]">
        <div className="bg-teal p-8">
          <p className="eyebrow text-mustard">{player.full} · Match Record</p>
          <div className="mt-6 flex items-end gap-8">
            <div>
              <p className="font-display text-7xl font-bold leading-none">
                {record.wins}
              </p>
              <p className="mt-2 eyebrow text-paper/60">Wins</p>
            </div>
            <span className="pb-3 font-display text-4xl text-paper/40">/</span>
            <div>
              <p className="font-display text-7xl font-bold leading-none text-paper/70">
                {record.losses}
              </p>
              <p className="mt-2 eyebrow text-paper/60">Losses</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/60">
              <span>Win rate</span>
              <span>{record.winPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-paper/20">
              <div
                className="h-full bg-mustard transition-all duration-500"
                style={{ width: `${record.winPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-teal-deep p-8">
          <p className="eyebrow text-mustard">Recent Form</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {record.form.map((r, i) => (
              <span
                key={i}
                className={cn(
                  'grid size-9 place-items-center font-mono text-sm font-bold',
                  r === 'W'
                    ? 'bg-mustard text-ink'
                    : r === 'L'
                      ? 'border border-paper/30 text-paper/50'
                      : 'border border-paper/20 text-paper/30'
                )}
              >
                {r}
              </span>
            ))}
          </div>
          <p className="mt-6 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/50">
            Oldest → most recent
          </p>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted-foreground">{card.label}</p>
              <card.icon className="size-4 text-terracotta" />
            </div>
            <p className="mt-4 font-display text-4xl font-bold tabular-nums text-ink">
              {card.value ?? <span className="text-muted-foreground/40">—</span>}
            </p>
            {card.hint && (
              <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                {card.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
        Score-based metrics activate once hole-by-hole scorecards are recorded.
      </p>
    </div>
  );
}
