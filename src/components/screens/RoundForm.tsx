'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Check, Flag, Trophy } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { fetchRounds, nextRoundId, saveRound } from '@/lib/rounds';
import { ALL_SEED_ROUNDS } from '@/data/seedData';
import { Course, CourseHole, TeeBox } from '@/data/courses';
import { HoleScore, RoundConditions, Round, RoundStatus } from '@/types';
import CourseSelector from '@/components/course/CourseSelector';
import TeeSelector from '@/components/course/TeeSelector';
import PageHeading from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type PlayerKey = 'stephan' | 'paul';
type WinnerChoice = PlayerKey | 'halved' | '';

interface HoleEntry {
  score: number | '';
  putts: number | '';
  gir?: boolean;
  fairway?: 'hit' | 'miss';
}
type HoleData = Record<number, Record<PlayerKey, HoleEntry>>;

const PLAYERS: { id: PlayerKey; name: string }[] = [
  { id: 'stephan', name: 'Stephan' },
  { id: 'paul', name: 'Paul' },
];

// Standard par-72 layout, used when the selected course/tee has no hole data.
const DEFAULT_PARS = [4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 3, 4, 5, 4];
const DEFAULT_HOLES: CourseHole[] = DEFAULT_PARS.map((par, i) => ({
  holeNumber: i + 1,
  par,
  handicap: i + 1,
}));

const emptyEntry = (): HoleEntry => ({ score: '', putts: '' });

function prefillHoleData(round?: Round): HoleData {
  const data: HoleData = {};
  if (!round?.scores?.length) return data;
  for (const s of round.scores) {
    if (s.playerId !== 'stephan' && s.playerId !== 'paul') continue;
    data[s.holeNumber] ??= { stephan: emptyEntry(), paul: emptyEntry() };
    data[s.holeNumber][s.playerId] = {
      score: s.score ?? '',
      putts: s.putts ?? '',
      gir: s.gir,
      fairway: s.fairway === 'na' ? undefined : s.fairway,
    };
  }
  return data;
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  optional,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  optional?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {optional && (
          <span className="ml-2 font-mono text-[0.625rem] font-normal normal-case tracking-wide text-muted-foreground">
            Optional
          </span>
        )}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'border px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] transition-colors',
              value === opt.value
                ? 'border-teal bg-teal text-paper'
                : 'border-input bg-background text-ink hover:bg-muted'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RoundFormProps {
  existingRound?: Round;
}

export default function RoundForm({ existingRound }: RoundFormProps) {
  const isEdit = !!existingRound;
  const router = useRouter();
  const user = getCurrentUser();

  const [date, setDate] = useState(
    existingRound?.playedAt ?? new Date().toISOString().split('T')[0]
  );
  const [courseId, setCourseId] = useState(existingRound?.courseId ?? '');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [, setSelectedTee] = useState<TeeBox | null>(null);
  const [courseHoles, setCourseHoles] = useState<CourseHole[]>(DEFAULT_HOLES);
  const [winner, setWinner] = useState<WinnerChoice>(
    existingRound ? (existingRound.winnerId as PlayerKey) ?? 'halved' : ''
  );
  const [conditions, setConditions] = useState<RoundConditions>(
    existingRound?.conditions ?? {}
  );
  const [holeData, setHoleData] = useState<HoleData>(() =>
    prefillHoleData(existingRound)
  );
  const [activePlayer, setActivePlayer] = useState<PlayerKey>('stephan');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const entry = (hole: number, player: PlayerKey): HoleEntry =>
    holeData[hole]?.[player] ?? emptyEntry();

  const updateEntry = (
    hole: number,
    player: PlayerKey,
    patch: Partial<HoleEntry>
  ) => {
    setHoleData((prev) => {
      const row = prev[hole] ?? { stephan: emptyEntry(), paul: emptyEntry() };
      return { ...prev, [hole]: { ...row, [player]: { ...row[player], ...patch } } };
    });
  };

  const totals = (player: PlayerKey) =>
    courseHoles.reduce(
      (acc, h) => {
        const e = entry(h.holeNumber, player);
        return {
          score: acc.score + (typeof e.score === 'number' ? e.score : 0),
          putts: acc.putts + (typeof e.putts === 'number' ? e.putts : 0),
        };
      },
      { score: 0, putts: 0 }
    );

  const stephanTotal = totals('stephan');
  const paulTotal = totals('paul');

  const handleCourseChange = (course: Course) => {
    setSelectedCourse(course);
    setSelectedTee(null);
    setCourseHoles(course.teeBoxes?.length ? DEFAULT_HOLES : course.holes || DEFAULT_HOLES);
  };

  const handleTeeSelect = (tee: TeeBox) => {
    setSelectedTee(tee);
    // Adopt the tee's pars but keep any scores already entered.
    setCourseHoles(tee.holes.length > 0 ? tee.holes : DEFAULT_HOLES);
  };

  const buildScores = (): HoleScore[] => {
    const scores: HoleScore[] = [];
    courseHoles.forEach((hole) => {
      PLAYERS.forEach(({ id }) => {
        const e = entry(hole.holeNumber, id);
        if (typeof e.score !== 'number') return;
        scores.push({
          id: `${hole.holeNumber}-${id}`,
          holeNumber: hole.holeNumber,
          playerId: id,
          score: e.score,
          ...(typeof e.putts === 'number' ? { putts: e.putts } : {}),
          ...(e.gir !== undefined ? { gir: e.gir } : {}),
          ...(e.fairway ? { fairway: e.fairway } : {}),
        });
      });
    });
    return scores;
  };

  const save = async (status: RoundStatus) => {
    setError('');

    // A round is only valid with the two required facts: course + result.
    const mustValidate = isEdit || status === 'PENDING_APPROVAL';
    if (mustValidate) {
      if (!courseId) {
        setError('Select the course that was played.');
        return;
      }
      if (!winner) {
        setError('Select who won the round.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      let id = existingRound?.id;
      if (!id) {
        const all = await fetchRounds(ALL_SEED_ROUNDS);
        id = nextRoundId('2026', all);
      }
      const winnerId = winner === 'halved' || winner === '' ? undefined : winner;

      const round: Round = {
        id,
        seasonId: existingRound?.seasonId ?? '2026',
        courseId: courseId || null,
        playedAt: date || null,
        submittedBy: existingRound?.submittedBy ?? user?.id ?? 'stephan',
        approvedBy: existingRound?.approvedBy,
        status,
        winnerId,
        scores: buildScores(),
        conditions,
        submittedAt: existingRound?.submittedAt ?? now,
        approvedAt: existingRound?.approvedAt,
        rejectionReason: existingRound?.rejectionReason,
        createdAt: existingRound?.createdAt ?? now,
        updatedAt: now,
        isHistorical: existingRound?.isHistorical,
      };

      await saveRound(round);
      router.push(`/rounds/view?id=${id}`);
    } catch {
      setError('Failed to save the round. Please try again.');
      setIsLoading(false);
    }
  };

  const scoreLeader =
    stephanTotal.score > 0 && paulTotal.score > 0
      ? stephanTotal.score < paulTotal.score
        ? 'Stephan'
        : stephanTotal.score > paulTotal.score
          ? 'Paul'
          : 'Level'
      : null;

  const winnerLabel =
    winner === 'stephan'
      ? 'Stephan'
      : winner === 'paul'
        ? 'Paul'
        : winner === 'halved'
          ? 'Halved'
          : '—';

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <PageHeading
        index="02"
        eyebrow={isEdit ? 'Edit' : 'Record'}
        title={isEdit ? 'Edit Round' : 'New Round'}
        description={
          isEdit
            ? 'Add scores and stats to this round. Only the course and result are required.'
            : 'Log a matchplay round. Only the course and result are required — everything else is optional.'
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(isEdit ? existingRound!.status : 'PENDING_APPROVAL');
          }}
          className="space-y-10"
        >
          {/* Step 1: result (required) */}
          <section className="space-y-5">
            <h2 className="flex items-center gap-3 font-display text-lg font-bold uppercase tracking-wide text-ink">
              <span className="grid size-6 place-items-center bg-terracotta font-mono text-xs text-paper">
                1
              </span>
              Result
              <span className="font-mono text-[0.625rem] font-normal normal-case tracking-wide text-terracotta">
                Required
              </span>
            </h2>
            <Segmented<WinnerChoice>
              label="Who won?"
              value={winner || undefined}
              onChange={setWinner}
              options={[
                { value: 'stephan', label: 'Stephan' },
                { value: 'halved', label: 'Halved' },
                { value: 'paul', label: 'Paul' },
              ]}
            />
            {scoreLeader && winner === '' && (
              <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
                Scorecard suggests: {scoreLeader}
              </p>
            )}
          </section>

          {/* Step 2: details */}
          <section className="space-y-5">
            <h2 className="flex items-center gap-3 font-display text-lg font-bold uppercase tracking-wide text-ink">
              <span className="grid size-6 place-items-center bg-terracotta font-mono text-xs text-paper">
                2
              </span>
              Course
              <span className="font-mono text-[0.625rem] font-normal normal-case tracking-wide text-terracotta">
                Required
              </span>
            </h2>

            <div className="max-w-xs space-y-2">
              <Label htmlFor="date">
                Date played
                <span className="ml-2 font-mono text-[0.625rem] font-normal normal-case tracking-wide text-muted-foreground">
                  Optional
                </span>
              </Label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full border border-input bg-background px-3 font-sans text-sm text-ink focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <CourseSelector
              value={courseId}
              onChange={setCourseId}
              onCourseSelect={handleCourseChange}
            />

            {isEdit && courseId && !selectedCourse && (
              <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
                A course is already on file — search above only if you want to
                change it.
              </p>
            )}

            {selectedCourse && selectedCourse.teeBoxes?.length ? (
              <TeeSelector course={selectedCourse} onTeeSelect={handleTeeSelect} />
            ) : null}
          </section>

          {/* Step 3: conditions */}
          <section className="space-y-5">
            <h2 className="flex items-center gap-3 font-display text-lg font-bold uppercase tracking-wide text-ink">
              <span className="grid size-6 place-items-center bg-ink font-mono text-xs text-paper">
                3
              </span>
              Conditions
              <span className="font-mono text-[0.625rem] font-normal normal-case tracking-wide text-muted-foreground">
                Optional
              </span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <Segmented
                label="Weather"
                optional
                value={conditions.weather}
                onChange={(v) => setConditions((p) => ({ ...p, weather: v }))}
                options={[
                  { value: 'dry', label: 'Dry' },
                  { value: 'raining', label: 'Raining' },
                ]}
              />
              <Segmented
                label="Wind"
                optional
                value={conditions.windSpeed}
                onChange={(v) => setConditions((p) => ({ ...p, windSpeed: v }))}
                options={[
                  { value: 'calm', label: 'Calm' },
                  { value: 'light', label: 'Light' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'strong', label: 'Strong' },
                ]}
              />
              <Segmented
                label="Fairways"
                optional
                value={conditions.fairwaysCondition}
                onChange={(v) =>
                  setConditions((p) => ({ ...p, fairwaysCondition: v }))
                }
                options={[
                  { value: 'hard', label: 'Hard' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'soft', label: 'Soft' },
                ]}
              />
              <Segmented
                label="Greens"
                optional
                value={conditions.greensSpeed}
                onChange={(v) => setConditions((p) => ({ ...p, greensSpeed: v }))}
                options={[
                  { value: 'fast', label: 'Fast' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'slow', label: 'Slow' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes
                <span className="ml-2 font-mono text-[0.625rem] font-normal normal-case tracking-wide text-muted-foreground">
                  Optional
                </span>
              </Label>
              <textarea
                id="notes"
                rows={3}
                value={conditions.notes || ''}
                onChange={(e) =>
                  setConditions((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Anything else worth noting about the day…"
                className="w-full border border-input bg-background px-3 py-2 font-sans text-sm text-ink placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </section>

          {/* Step 4: scorecard */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-3 font-display text-lg font-bold uppercase tracking-wide text-ink">
                <span className="grid size-6 place-items-center bg-ink font-mono text-xs text-paper">
                  4
                </span>
                Scorecard &amp; stats
                <span className="font-mono text-[0.625rem] font-normal normal-case tracking-wide text-muted-foreground">
                  Optional
                </span>
              </h2>
              <div className="ml-auto inline-flex border border-ink">
                {PLAYERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePlayer(p.id)}
                    className={cn(
                      'px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] transition-colors',
                      activePlayer === p.id
                        ? 'bg-ink text-paper'
                        : 'bg-transparent text-ink hover:bg-muted'
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
              <Flag className="size-3.5 text-terracotta" />
              Enter as much or as little as you like — putts, GIR and fairways feed
              the stats page.
            </p>

            <div className="overflow-x-auto border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ink text-paper">
                    <th className="px-3 py-2 text-left font-mono text-[0.625rem] uppercase tracking-wide">
                      Hole
                    </th>
                    <th className="px-3 py-2 text-left font-mono text-[0.625rem] uppercase tracking-wide">
                      Par
                    </th>
                    <th className="px-3 py-2 text-center font-mono text-[0.625rem] uppercase tracking-wide">
                      Score
                    </th>
                    <th className="px-3 py-2 text-center font-mono text-[0.625rem] uppercase tracking-wide">
                      Putts
                    </th>
                    <th className="px-3 py-2 text-center font-mono text-[0.625rem] uppercase tracking-wide">
                      GIR
                    </th>
                    <th className="px-3 py-2 text-center font-mono text-[0.625rem] uppercase tracking-wide">
                      Fairway
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courseHoles.map((hole, i) => {
                    const e = entry(hole.holeNumber, activePlayer);
                    return (
                      <tr
                        key={hole.holeNumber}
                        className={cn(
                          'border-t border-border',
                          i % 2 === 1 && 'bg-muted/30'
                        )}
                      >
                        <td className="px-3 py-2 font-display font-bold text-ink">
                          {hole.holeNumber}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {hole.par}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={15}
                            value={e.score}
                            onChange={(ev) =>
                              updateEntry(hole.holeNumber, activePlayer, {
                                score:
                                  ev.target.value === ''
                                    ? ''
                                    : Math.max(
                                        1,
                                        Math.min(15, parseInt(ev.target.value) || 0)
                                      ),
                              })
                            }
                            placeholder="–"
                            className="h-9 w-14 border border-input bg-background text-center font-display text-sm font-bold text-ink focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={10}
                            value={e.putts}
                            onChange={(ev) =>
                              updateEntry(hole.holeNumber, activePlayer, {
                                putts:
                                  ev.target.value === ''
                                    ? ''
                                    : Math.max(
                                        0,
                                        Math.min(10, parseInt(ev.target.value) || 0)
                                      ),
                              })
                            }
                            placeholder="–"
                            className="h-9 w-14 border border-input bg-background text-center font-display text-sm font-bold text-ink focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              updateEntry(hole.holeNumber, activePlayer, {
                                gir: !e.gir,
                              })
                            }
                            className={cn(
                              'grid size-8 place-items-center border transition-colors',
                              e.gir
                                ? 'border-teal bg-teal text-paper'
                                : 'border-input bg-background text-muted-foreground hover:bg-muted'
                            )}
                            aria-label="Green in regulation"
                          >
                            {e.gir ? <Check className="size-4" /> : '–'}
                          </button>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <div className="inline-flex border border-input">
                            {(['hit', 'miss'] as const).map((fw) => (
                              <button
                                key={fw}
                                type="button"
                                onClick={() =>
                                  updateEntry(hole.holeNumber, activePlayer, {
                                    fairway: e.fairway === fw ? undefined : fw,
                                  })
                                }
                                className={cn(
                                  'px-2 py-1 font-mono text-[0.625rem] font-bold uppercase transition-colors',
                                  e.fairway === fw
                                    ? fw === 'hit'
                                      ? 'bg-teal text-paper'
                                      : 'bg-terracotta text-paper'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                                )}
                              >
                                {fw === 'hit' ? 'Hit' : 'Miss'}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink bg-secondary">
                    <td
                      colSpan={2}
                      className="px-3 py-2 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground"
                    >
                      {PLAYERS.find((p) => p.id === activePlayer)?.name} total
                    </td>
                    <td className="px-3 py-2 text-center font-display text-base font-bold text-ink">
                      {totals(activePlayer).score || '–'}
                    </td>
                    <td className="px-3 py-2 text-center font-display text-base font-bold text-ink">
                      {totals(activePlayer).putts || '–'}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-2 border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            {isEdit ? (
              <Button type="submit" variant="accent" disabled={isLoading}>
                {isLoading ? <Spinner className="size-4" /> : 'Save changes'}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => save('DRAFT')}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner className="size-4" /> : 'Save draft'}
                </Button>
                <Button type="submit" variant="accent" disabled={isLoading}>
                  {isLoading ? <Spinner className="size-4" /> : 'Submit for review'}
                </Button>
              </>
            )}
          </div>
        </form>

        {/* Live summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border-2 border-ink bg-card">
            <div className="bg-ink px-5 py-3">
              <p className="eyebrow text-paper/70">Live summary</p>
            </div>
            <dl className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-3">
                <dt className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
                  Result
                </dt>
                <dd className="font-display text-sm font-semibold text-ink">
                  {winnerLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <dt className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
                  Course
                </dt>
                <dd className="max-w-[9rem] truncate text-right font-display text-sm font-semibold text-ink">
                  {selectedCourse?.name ?? (courseId ? 'On file' : '—')}
                </dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <dt className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
                  Stephan
                </dt>
                <dd className="font-display text-lg font-bold tabular-nums text-ink">
                  {stephanTotal.score || '–'}
                </dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <dt className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
                  Paul
                </dt>
                <dd className="font-display text-lg font-bold tabular-nums text-ink">
                  {paulTotal.score || '–'}
                </dd>
              </div>
            </dl>
            <div className="flex items-center gap-2 border-t-2 border-ink bg-teal px-5 py-4 text-paper">
              <Trophy className="size-4 text-mustard" />
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/70">
                Winner
              </span>
              <span className="ml-auto font-display text-base font-bold uppercase">
                {winnerLabel}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
