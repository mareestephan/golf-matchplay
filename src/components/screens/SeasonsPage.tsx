'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
import {
  HISTORICAL_ROUNDS_2025_2026,
  HISTORICAL_ROUNDS_2026,
} from '@/data/seedData';
import { calculateSeasonStandings } from '@/lib/calculations';
import { useRounds } from '@/hooks/useRounds';
import type { StandingsData } from '@/types';
import { Badge } from '@/components/ui/badge';
import PageHeading from '@/components/layout/PageHeading';

const TARGET = 10;

export default function SeasonsPage() {
  const rounds2026 = useRounds(HISTORICAL_ROUNDS_2026);
  const standings2026 = useMemo(
    () =>
      calculateSeasonStandings(
        rounds2026.filter((r) => r.status === 'APPROVED')
      ),
    [rounds2026]
  );
  const standings20252026 = useMemo(
    () => calculateSeasonStandings(HISTORICAL_ROUNDS_2025_2026),
    []
  );

  return (
    <div>
      <PageHeading
        index="03"
        eyebrow="The Rivalry"
        title="Seasons"
        description="Each season runs until one player reaches ten match wins."
      />

      <div className="space-y-8">
        <SeasonCard
          name="2026"
          status="IN_PROGRESS"
          standings={standings2026}
        />
        <SeasonCard
          name="2025 – 2026"
          status="COMPLETED"
          standings={standings20252026}
          championId="paul"
        />
      </div>
    </div>
  );
}

function SeasonCard({
  name,
  status,
  standings,
  championId,
}: {
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  standings: StandingsData;
  championId?: 'stephan' | 'paul';
}) {
  const inProgress = status === 'IN_PROGRESS';
  const leaderWins = Math.max(standings.stephanWins, standings.paulWins);
  const rows = [
    { id: 'stephan' as const, name: 'Stephan Maree', wins: standings.stephanWins },
    { id: 'paul' as const, name: 'Paul Du Plessis', wins: standings.paulWins },
  ].sort((a, b) => b.wins - a.wins);

  return (
    <section className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-5 lg:px-8">
        <div>
          <p className="eyebrow text-terracotta">Season</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-ink">
            {name}
          </h2>
        </div>
        <Badge variant={inProgress ? 'teal' : 'muted'}>
          {inProgress ? 'In Progress' : 'Completed'}
        </Badge>
      </div>

      <div className="px-6 py-6 lg:px-8">
        <div className="divide-y divide-border">
          {rows.map((row) => {
            const isChampion = !inProgress && championId === row.id;
            return (
              <div
                key={row.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span className="flex items-center gap-3">
                  {isChampion && <Trophy className="size-4 text-mustard" />}
                  <span
                    className={`font-display text-lg font-semibold ${
                      isChampion ? 'text-ink' : 'text-ink'
                    }`}
                  >
                    {row.name}
                  </span>
                  {isChampion && <Badge variant="mustard">Champion</Badge>}
                </span>
                <span className="font-display text-3xl font-bold tabular-nums text-ink">
                  {row.wins}
                </span>
              </div>
            );
          })}
        </div>

        {inProgress ? (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
              <span>Race to {TARGET}</span>
              <span>
                {leaderWins} / {TARGET}
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary">
              <div
                className="h-full bg-terracotta transition-all duration-500"
                style={{ width: `${(leaderWins / TARGET) * 100}%` }}
              />
            </div>
            <Link
              href="/rounds"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-teal transition-colors hover:text-terracotta"
            >
              View rounds
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <p className="mt-6 border-t border-border pt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Final result · {championId === 'paul' ? 'Paul' : 'Stephan'} took the
            season
          </p>
        )}
      </div>
    </section>
  );
}
