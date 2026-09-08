'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Flag, Trophy } from 'lucide-react';
import { SEASONS, HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import { calculateSeasonStandings } from '@/lib/calculations';
import { useRounds } from '@/hooks/useRounds';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TARGET = 10;

function playerName(id?: string | null) {
  if (id === 'stephan') return 'Stephan';
  if (id === 'paul') return 'Paul';
  return null;
}

export default function HomePage() {
  const currentSeason = SEASONS.find((s) => s.status === 'IN_PROGRESS');
  const rounds = useRounds(HISTORICAL_ROUNDS_2026);

  const standings = useMemo(
    () =>
      currentSeason
        ? calculateSeasonStandings(
            rounds.filter((r) => r.status === 'APPROVED')
          )
        : { stephanWins: 0, paulWins: 0, ties: 0 },
    [currentSeason, rounds]
  );

  const recentRounds = useMemo(
    () =>
      [...rounds]
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        )
        .slice(0, 5),
    [rounds]
  );

  const { stephanWins, paulWins } = standings;
  const played = stephanWins + paulWins + standings.ties;
  const leaderIsStephan = stephanWins >= paulWins;
  const leader = leaderIsStephan ? 'Stephan' : 'Paul';
  const leaderWins = Math.max(stephanWins, paulWins);
  const margin = Math.abs(stephanWins - paulWins);

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero */}
      <section className="grid gap-10 border-t-2 border-ink pt-6 lg:grid-cols-12 lg:gap-8 lg:pt-8">
        <div className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-2 text-terracotta">
            <span>Season 2026</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-ink">Matchplay</span>
          </p>
          <h1 className="mt-6 font-display text-[clamp(3rem,9vw,7rem)] font-bold uppercase leading-[0.85] tracking-tight text-ink">
            Stephan
            <br />
            <span className="inline-flex items-baseline gap-4">
              <span className="text-terracotta">vs</span>
              <span>Paul</span>
            </span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
            {played === 0
              ? 'The season is set. First to ten match wins takes the year.'
              : `${leader} leads by ${margin === 0 ? 'nothing — it is all square' : `${margin} match${margin > 1 ? 'es' : ''}`}. First to ten takes the season.`}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/rounds/new">
                New Round
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/rounds">View Rounds</Link>
            </Button>
          </div>
        </div>

        {/* Scoreboard panel */}
        <div className="lg:col-span-5">
          <div className="flex h-full flex-col justify-between bg-teal p-8 text-paper">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-mustard">Standings</p>
              <Badge variant="mustard">Live</Badge>
            </div>

            <div className="my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">
                  Stephan
                </p>
                <p className="mt-2 font-display text-7xl font-bold leading-none">
                  {stephanWins}
                </p>
              </div>
              <span className="font-display text-3xl text-paper/40">/</span>
              <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">
                  Paul
                </p>
                <p className="mt-2 font-display text-7xl font-bold leading-none">
                  {paulWins}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/60">
                <span>{leader} leads</span>
                <span>{leaderWins} / {TARGET}</span>
              </div>
              <div className="h-1.5 w-full bg-paper/20">
                <div
                  className="h-full bg-mustard transition-all duration-500"
                  style={{ width: `${(leaderWins / TARGET) * 100}%` }}
                />
              </div>
              <p className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/60">
                {played} match{played === 1 ? '' : 'es'} played · {TARGET} to win
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-2 divide-x divide-border border-y border-border md:grid-cols-4">
        <Stat label="Matches Played" value={played} />
        <Stat label="Current Leader" value={leader} accent="terracotta" />
        <Stat label="Winning Margin" value={margin === 0 ? 'Level' : `+${margin}`} />
        <Stat label="To Clinch" value={TARGET - leaderWins} />
      </section>

      {/* Recent rounds */}
      <section>
        <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="eyebrow text-terracotta">Latest</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-ink">
              Recent Rounds
            </h2>
          </div>
          <Link
            href="/rounds"
            className="hidden items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-teal transition-colors hover:text-terracotta sm:flex"
          >
            All rounds
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {recentRounds.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-16 text-center">
            <Flag className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No rounds yet. Play your first round.
            </p>
          </div>
        ) : (
          <>
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
              {recentRounds.map((round, i) => {
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
                      <span className="min-w-0">
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
          </>
        )}
      </section>

      {/* CTA */}
      <section className="flex flex-col items-start justify-between gap-6 bg-ink px-8 py-12 text-paper md:flex-row md:items-center lg:px-12">
        <div>
          <p className="eyebrow text-mustard">Your move</p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            Ready for the next round?
          </h2>
        </div>
        <Button asChild size="lg" variant="accent">
          <Link href="/rounds/new">
            Record a round
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: 'terracotta';
}) {
  return (
    <div className="px-4 py-6 sm:px-6">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p
        className={`mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl ${
          accent === 'terracotta' ? 'text-terracotta' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
