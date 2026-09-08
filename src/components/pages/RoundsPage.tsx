'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import styles from './RoundsPage.module.scss';

export default function RoundsPage() {
  const sortedRounds = useMemo(() => {
    return [...HISTORICAL_ROUNDS_2026].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles['page__header']}>
        <h1 className={styles['page__title']}>Round History</h1>
        <Link href="/rounds/new" className={styles['page__button']}>
          + New Round
        </Link>
      </div>

      <div className={styles['page__content']}>
        {sortedRounds.length === 0 ? (
          <div className={styles['page__empty']}>
            <p>No rounds yet.</p>
            <Link href="/rounds/new" className={styles['page__link']}>
              Play your first round →
            </Link>
          </div>
        ) : (
          <div className={styles['page__table']}>
            <div className={styles['table__header']}>
              <div className={styles['table__cell']}>Date</div>
              <div className={styles['table__cell']}>Course</div>
              <div className={styles['table__cell']}>Stephan</div>
              <div className={styles['table__cell']}>Paul</div>
              <div className={styles['table__cell']}>Result</div>
              <div className={styles['table__cell']}>Status</div>
            </div>

            {sortedRounds.map((round) => (
              <Link
                key={round.id}
                href={`/rounds/view?id=${round.id}`}
                className={styles['table__row']}
              >
                <div className={styles['table__cell']}>
                  {round.playedAt
                    ? new Date(round.playedAt).toLocaleDateString('en-ZA', {
                        day: '2-digit',
                        month: 'short',
                      })
                    : '—'}
                </div>
                <div className={styles['table__cell']}>
                  {round.courseId ? 'Course' : '—'}
                </div>
                <div className={styles['table__cell']}>—</div>
                <div className={styles['table__cell']}>—</div>
                <div className={styles['table__cell']}>
                  {round.winnerId === 'stephan'
                    ? 'S'
                    : round.winnerId === 'paul'
                      ? 'P'
                      : '—'}
                </div>
                <div className={styles['table__cell']}>
                  <span
                    className={
                      round.status === 'APPROVED'
                        ? styles['status--approved']
                        : styles['status--pending']
                    }
                  >
                    {round.status === 'APPROVED' ? '✓' : '◯'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
