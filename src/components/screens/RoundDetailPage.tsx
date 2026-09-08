'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Flag,
  MapPin,
  Pencil,
  Trophy,
  XCircle,
} from 'lucide-react';
import { calculateRoundWinner } from '@/lib/calculations';
import { getCurrentUser } from '@/lib/auth';
import { saveNotification, createNotification } from '@/lib/notifications';
import { fetchRound, saveRound } from '@/lib/rounds';
import { Round, RoundStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface RoundDetailPageProps {
  roundId: string;
}

const PLAYER_NAME: Record<string, string> = {
  stephan: 'Stephan',
  paul: 'Paul',
};

function playerName(id?: string) {
  if (!id) return '—';
  return PLAYER_NAME[id] ?? id;
}

const STATUS_VARIANT: Record<RoundStatus, 'muted' | 'mustard' | 'success' | 'terracotta'> = {
  DRAFT: 'muted',
  PENDING_APPROVAL: 'mustard',
  APPROVED: 'success',
  REJECTED: 'terracotta',
};

const STATUS_LABEL: Record<RoundStatus, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export default function RoundDetailPage({ roundId }: RoundDetailPageProps) {
  const currentUser = getCurrentUser();
  const [round, setRound] = useState<Round | undefined>();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    fetchRound(roundId)
      .then((r) => {
        if (active) {
          setRound(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roundId]);

  const scorecard = useMemo(() => {
    if (!round?.scores?.length) return [];
    const byHole = new Map<
      number,
      { hole: number; stephan?: number; paul?: number }
    >();
    for (const s of round.scores) {
      const row = byHole.get(s.holeNumber) ?? { hole: s.holeNumber };
      if (s.playerId === 'stephan') row.stephan = s.score;
      if (s.playerId === 'paul') row.paul = s.score;
      byHole.set(s.holeNumber, row);
    }
    return [...byHole.values()].sort((a, b) => a.hole - b.hole);
  }, [round]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!round) {
    notFound();
  }

  const winner = round.winnerId || calculateRoundWinner(round);
  const isAdmin = currentUser?.role === 'admin';
  const canApprove = isAdmin && round.status === 'PENDING_APPROVAL';

  const totalStephan = scorecard.reduce((sum, r) => sum + (r.stephan ?? 0), 0);
  const totalPaul = scorecard.reduce((sum, r) => sum + (r.paul ?? 0), 0);

  const applyPatch = async (patch: Partial<Round>): Promise<void> => {
    if (!round) return;
    const updated: Round = {
      ...round,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await saveRound(updated);
    setRound(updated);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setMessage('');
    try {
      await applyPatch({ status: 'APPROVED', approvedBy: currentUser?.id });
      saveNotification(
        createNotification(
          round.submittedBy,
          'ROUND_APPROVED',
          roundId,
          `Your round was approved by ${currentUser?.name}.`
        )
      );
      setMessage('Round approved.');
    } catch {
      setMessage('Could not approve the round. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    setMessage('');
    try {
      await applyPatch({
        status: 'REJECTED',
        approvedBy: currentUser?.id,
        rejectionReason: rejectReason.trim(),
      });
      saveNotification(
        createNotification(
          round.submittedBy,
          'ROUND_REJECTED',
          roundId,
          `Your round was rejected: ${rejectReason.trim()}`
        )
      );
      setRejecting(false);
      setMessage('Round rejected.');
    } catch {
      setMessage('Could not reject the round. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setIsProcessing(true);
    try {
      await applyPatch({ status: 'PENDING_APPROVAL' });
      setMessage('Round submitted for review.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Link
        href="/rounds"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" /> All rounds
      </Link>

      {/* Header band */}
      <div className="border-t-2 border-ink pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow text-terracotta">Round detail</p>
          <Badge variant={STATUS_VARIANT[round.status]}>
            {STATUS_LABEL[round.status]}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-[0.95] text-ink">
            {winner ? `${playerName(winner)} takes it` : 'Result pending'}
          </h1>
          <Button asChild variant="outline" size="sm">
            <Link href={`/rounds/new?edit=${round.id}`}>
              <Pencil className="size-4" />
              {scorecard.length ? 'Edit round' : 'Add scores'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Meta */}
      <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-card p-5">
          <dt className="flex items-center gap-1.5 eyebrow text-muted-foreground">
            <Calendar className="size-3.5" /> Date
          </dt>
          <dd className="mt-2 font-display text-lg font-semibold text-ink">
            {round.playedAt
              ? new Date(round.playedAt).toLocaleDateString('en-ZA', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'TBD'}
          </dd>
        </div>
        <div className="bg-card p-5">
          <dt className="flex items-center gap-1.5 eyebrow text-muted-foreground">
            <MapPin className="size-3.5" /> Course
          </dt>
          <dd className="mt-2 font-display text-lg font-semibold text-ink">
            {round.courseId ? 'On record' : 'TBD'}
          </dd>
        </div>
        <div className="bg-card p-5">
          <dt className="flex items-center gap-1.5 eyebrow text-muted-foreground">
            <Trophy className="size-3.5" /> Winner
          </dt>
          <dd className="mt-2 font-display text-lg font-semibold text-ink">
            {winner ? playerName(winner) : 'Undecided'}
          </dd>
        </div>
      </dl>

      {/* Conditions */}
      {round.conditions &&
        Object.values(round.conditions).some((v) => v !== undefined) && (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink">
              Conditions
            </h2>
            <div className="flex flex-wrap gap-2">
              {round.conditions.weather && (
                <Badge variant="outline">
                  {round.conditions.weather === 'raining' ? 'Raining' : 'Dry'}
                </Badge>
              )}
              {round.conditions.windSpeed && (
                <Badge variant="outline">Wind: {round.conditions.windSpeed}</Badge>
              )}
              {round.conditions.fairwaysCondition && (
                <Badge variant="outline">
                  Fairways: {round.conditions.fairwaysCondition}
                </Badge>
              )}
              {round.conditions.greensSpeed && (
                <Badge variant="outline">
                  Greens: {round.conditions.greensSpeed}
                </Badge>
              )}
              {round.conditions.grainAffected !== undefined && (
                <Badge variant="outline">
                  Grain: {round.conditions.grainAffected ? 'yes' : 'no'}
                </Badge>
              )}
            </div>
            {round.conditions.notes && (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {round.conditions.notes}
              </p>
            )}
          </section>
        )}

      {/* Scorecard */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink">
          Scorecard
        </h2>
        {scorecard.length > 0 ? (
          <div className="overflow-x-auto border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ink text-paper">
                  <th className="px-3 py-2 text-left font-mono text-[0.625rem] uppercase tracking-wide">
                    Hole
                  </th>
                  <th className="px-3 py-2 text-center font-mono text-[0.625rem] uppercase tracking-wide">
                    Stephan
                  </th>
                  <th className="px-3 py-2 text-center font-mono text-[0.625rem] uppercase tracking-wide">
                    Paul
                  </th>
                </tr>
              </thead>
              <tbody>
                {scorecard.map((row, i) => (
                  <tr
                    key={row.hole}
                    className={cn('border-t border-border', i % 2 === 1 && 'bg-muted/30')}
                  >
                    <td className="px-3 py-2 font-display font-bold text-ink">
                      {row.hole}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 text-center font-display font-bold',
                        row.stephan !== undefined &&
                          row.paul !== undefined &&
                          row.stephan < row.paul
                          ? 'text-teal'
                          : 'text-ink'
                      )}
                    >
                      {row.stephan ?? '–'}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 text-center font-display font-bold',
                        row.stephan !== undefined &&
                          row.paul !== undefined &&
                          row.paul < row.stephan
                          ? 'text-teal'
                          : 'text-ink'
                      )}
                    >
                      {row.paul ?? '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink bg-secondary">
                  <td className="px-3 py-2 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                    Total
                  </td>
                  <td className="px-3 py-2 text-center font-display text-base font-bold text-ink">
                    {totalStephan || '–'}
                  </td>
                  <td className="px-3 py-2 text-center font-display text-base font-bold text-ink">
                    {totalPaul || '–'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-3 border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
            <Flag className="size-5 shrink-0 text-terracotta" />
            No hole-by-hole scores were recorded for this round.
          </div>
        )}
      </section>

      {/* Actions */}
      <section className="mt-8 border-t border-border pt-6">
        {message && (
          <div
            className={cn(
              'mb-4 flex items-center gap-2 border p-3 text-sm',
              message.includes('Could not')
                ? 'border-danger/40 bg-danger/10 text-danger'
                : 'border-success/40 bg-success/10 text-success'
            )}
          >
            {message.includes('Could not') ? (
              <XCircle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {message}
          </div>
        )}

        {round.status === 'DRAFT' && (
          <Button onClick={handleSubmitForApproval} disabled={isProcessing}>
            Submit for review
          </Button>
        )}

        {canApprove && !rejecting && (
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleApprove} disabled={isProcessing}>
              <CheckCircle2 className="size-4" /> Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setRejecting(true)}
              disabled={isProcessing}
            >
              <XCircle className="size-4" /> Reject
            </Button>
          </div>
        )}

        {canApprove && rejecting && (
          <div className="max-w-md space-y-3">
            <Label htmlFor="reject-reason">Reason for rejection</Label>
            <textarea
              id="reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Let the submitter know what to fix…"
              className="w-full border border-input bg-background px-3 py-2 font-sans text-sm text-ink placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
              >
                Confirm rejection
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setRejecting(false);
                  setRejectReason('');
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {round.status === 'APPROVED' && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" />
            Approved{round.approvedBy ? ` by ${playerName(round.approvedBy)}` : ''}.
          </div>
        )}

        {round.status === 'REJECTED' && (
          <div className="flex items-start gap-2 text-sm text-danger">
            <XCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              Rejected
              {round.rejectionReason ? ` — ${round.rejectionReason}` : ''}.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
