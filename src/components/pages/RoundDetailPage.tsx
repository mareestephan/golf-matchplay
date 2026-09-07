'use client';

import { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { HISTORICAL_ROUNDS_2026, HISTORICAL_ROUNDS_2025_2026 } from '@/data/seedData';
import { calculateRoundWinner } from '@/lib/calculations';
import { getCurrentUser } from '@/lib/auth';
import { saveNotification, createNotification } from '@/lib/notifications';
import styles from './RoundDetailPage.module.scss';

interface RoundDetailPageProps {
  roundId: string;
}

export default function RoundDetailPage({ roundId }: RoundDetailPageProps) {
  const currentUser = getCurrentUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const round = useMemo(() => {
    // Check new rounds stored in localStorage
    if (typeof window !== 'undefined') {
      const roundsData = localStorage.getItem('matchplay_rounds');
      if (roundsData) {
        const newRounds = JSON.parse(roundsData);
        const found = newRounds.find((r: any) => r.id === roundId);
        if (found) return found;
      }
    }
    
    // Check seed data
    return HISTORICAL_ROUNDS_2026.find((r) => r.id === roundId) ||
           HISTORICAL_ROUNDS_2025_2026.find((r) => r.id === roundId);
  }, [roundId]);

  if (!round) {
    notFound();
  }

  const winner = round.winnerId || calculateRoundWinner(round);
  const isAdmin = currentUser?.role === 'admin';
  const canApprove = isAdmin && round.status === 'PENDING_APPROVAL';

  const handleApprove = async () => {
    setIsProcessing(true);
    setMessage('');
    
    try {
      // Update round status in localStorage
      const roundsData = localStorage.getItem('matchplay_rounds');
      if (roundsData) {
        const rounds = JSON.parse(roundsData);
        const updated = rounds.map((r: any) =>
          r.id === roundId
            ? { ...r, status: 'APPROVED', approvedBy: currentUser?.id }
            : r
        );
        localStorage.setItem('matchplay_rounds', JSON.stringify(updated));
      }

      // Create notification for the submitter
      const notif = createNotification(
        round.submittedBy,
        'ROUND_APPROVED',
        roundId,
        `Your round submission has been approved by ${currentUser?.name}`
      );
      saveNotification(notif);

      setMessage('Round approved successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage('Failed to approve round. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setIsProcessing(true);
    setMessage('');

    try {
      // Update round status in localStorage
      const roundsData = localStorage.getItem('matchplay_rounds');
      if (roundsData) {
        const rounds = JSON.parse(roundsData);
        const updated = rounds.map((r: any) =>
          r.id === roundId
            ? { ...r, status: 'REJECTED', approvedBy: currentUser?.id, rejectionReason: reason }
            : r
        );
        localStorage.setItem('matchplay_rounds', JSON.stringify(updated));
      }

      // Create notification for the submitter
      const notif = createNotification(
        round.submittedBy,
        'ROUND_REJECTED',
        roundId,
        `Your round submission was rejected: ${reason}`
      );
      saveNotification(notif);

      setMessage('Round rejected successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage('Failed to reject round. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles['page__header']}>
        <h1 className={styles['page__title']}>Round Detail</h1>
      </div>

      <div className={styles['page__content']}>
        <section className={styles.card}>
          {/* Round Info */}
          <div className={styles['section']}>
            <h2 className={styles['section__title']}>Round Info</h2>
            <div className={styles['info-grid']}>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Date</span>
                <span className={styles['info-value']}>
                  {round.playedAt
                    ? new Date(round.playedAt).toLocaleDateString('en-ZA', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'TBD'}
                </span>
              </div>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Course</span>
                <span className={styles['info-value']}>
                  {round.courseId ? 'Course details' : 'TBD'}
                </span>
              </div>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Status</span>
                <span className={`${styles['info-value']} ${styles[`status-${round.status.toLowerCase()}`]}`}>
                  {round.status}
                </span>
              </div>
            </div>
          </div>

          {/* Scores Section */}
          <div className={styles['section']}>
            <h2 className={styles['section__title']}>Scores</h2>
            {round.scores && round.scores.length > 0 ? (
              <div className={styles['scorecard']}>
                {/* Render hole scores here */}
                <p>Hole-by-hole scores available</p>
              </div>
            ) : (
              <p className={styles['empty']}>No scores recorded yet</p>
            )}
          </div>

          {/* Result Section */}
          <div className={styles['section']}>
            <h2 className={styles['section__title']}>Result</h2>
            {winner ? (
              <div className={styles['result']}>
                <p className={styles['result__winner']}>
                  {winner === 'stephan' ? 'STEPHAN' : 'PAUL'} WINS
                </p>
              </div>
            ) : (
              <p className={styles['empty']}>Scores needed to determine winner</p>
            )}
          </div>

          {/* Actions */}
          <div className={styles['section']}>
            {message && (
              <div className={`${styles['message']} ${message.includes('successfully') ? styles['message--success'] : styles['message--error']}`}>
                {message}
              </div>
            )}
            <div className={styles['actions']}>
              {round.status === 'PENDING_APPROVAL' && canApprove && (
                <>
                  <button
                    className={`${styles['button']} ${styles['button--primary']}`}
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '⟳ Processing...' : '✓ Approve Round'}
                  </button>
                  <button
                    className={`${styles['button']} ${styles['button--danger']}`}
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '⟳ Processing...' : '✕ Reject Round'}
                  </button>
                </>
              )}
              {round.status === 'DRAFT' && (
                <button className={`${styles['button']} ${styles['button--primary']}`}>
                  Submit for Approval
                </button>
              )}
              {round.status === 'APPROVED' && (
                <div className={styles['status-approved']}>
                  ✓ Round Approved by {round.approvedBy}
                </div>
              )}
              {round.status === 'REJECTED' && (
                <div className={styles['status-rejected']}>
                  ✕ Round Rejected {round.rejectionReason && `(${round.rejectionReason})`}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
