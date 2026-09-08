'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Trophy } from 'lucide-react';
import { HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import { useRounds } from '@/hooks/useRounds';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeading from '@/components/layout/PageHeading';

function playerName(id?: string | null) {
  if (id === 'stephan') return 'Stephan';
  if (id === 'paul') return 'Paul';
  return null;
}

export default function RoundsPage() {
  const rounds = useRounds(HISTORICAL_ROUNDS_2026);
  const sortedRounds = useMemo(
    () =>
      [...rounds].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      ),
    [rounds]
  );

  return (
    <div>
      <PageHeading
        index="01"
        eyebrow="Season 2026"
        title="Round History"
        description="Every recorded match of the season, most recent first."
        action={
          <Button asChild variant="accent">
            <Link href="/rounds/new">
              <Plus className="size-4" />
              New Round
            </Link>
          </Button>
        }
      />

      {sortedRounds.length === 0 ? (
        <div className="border border-dashed border-border px-6 py-20 text-center">
          <p className="text-muted-foreground">No rounds yet.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/rounds/new">Play your first round</Link>
          </Button>
        </div>
      ) : (
        <div className="border-t border-border">
          {/* Column header */}
          <div className="hidden grid-cols-[3rem_8rem_1fr_1fr_8rem_2rem] items-center gap-6 border-b border-border px-2 py-3 sm:grid">
            <span className="eyebrow text-muted-foreground">#</span>
            <span className="eyebrow text-muted-foreground">Date</span>
            <span className="eyebrow text-muted-foreground">Match</span>
            <span className="eyebrow text-muted-foreground">Result</span>
            <span className="eyebrow text-muted-foreground">Status</span>
            <span />
          </div>

          <ul className="divide-y divide-border">
            {sortedRounds.map((round, i) => {
              console.log("appels", round)
              const winner = playerName(round.winnerId);
              const number = round.id.split('-').pop();
              return (
                <li key={round.id}>
                  <Link
                    href={`/rounds/view?id=${round.id}`}
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5 transition-colors hover:bg-card sm:grid-cols-[3rem_8rem_1fr_1fr_8rem_2rem] sm:gap-6 sm:px-2"
                  >
                    <span className="font-mono text-sm text-muted-foreground">
                      {String(number ?? i + 1).padStart(2, '0')}
                    </span>
                    <span className="hidden sm:block">
                      <span className="block font-mono text-sm text-ink">
                        {round.playedAt
                          ? new Date(round.playedAt).toLocaleDateString(
                              'en-ZA',
                              { day: '2-digit', month: 'short', year: 'numeric' }
                            )
                          : '—'}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                        {round.isHistorical ? 'Historical' : 'Recorded'}
                      </span>
                    </span>
                    <span>
                      <span className="block font-display text-lg font-semibold text-ink">
                        {round.courseName ?? `Match ${number}`}
                      </span>
                      <span className="block font-mono text-xs uppercase tracking-wide text-muted-foreground sm:hidden">
                        {round.playedAt
                          ? new Date(round.playedAt).toLocaleDateString(
                              'en-ZA',
                              { day: '2-digit', month: 'short', year: 'numeric' }
                            )
                          : round.isHistorical
                            ? 'Historical'
                            : 'Recorded'}
                      </span>
                    </span>
                    <span className="hidden items-center gap-2 sm:flex">
                      {winner ? (
                        <>
                          <Trophy className="size-4 text-mustard" />
                          <span className="font-mono text-xs font-bold uppercase tracking-wide text-ink">
                            {winner} won
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-3 justify-self-end sm:justify-self-start">
                      <Badge
                        variant={
                          round.status === 'APPROVED' ? 'success' : 'outline'
                        }
                      >
                        {round.status === 'APPROVED' ? 'Approved' : round.status}
                      </Badge>
                    </span>
                    <ArrowRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-terracotta sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
