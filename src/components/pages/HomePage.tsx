'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { SEASONS, HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import { calculateSeasonStandings } from '@/lib/calculations';
import styles from './HomePage.module.scss';

export default function HomePage() {
  const currentSeason = SEASONS.find((s) => s.status === 'IN_PROGRESS');
  const standings = useMemo(() => {
    if (!currentSeason) return { stephanWins: 0, paulWins: 0, ties: 0 };
    return calculateSeasonStandings(HISTORICAL_ROUNDS_2026);
  }, [currentSeason]);

  const recentRounds = HISTORICAL_ROUNDS_2026.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  ).slice(0, 5);

  const leader = standings.stephanWins > standings.paulWins ? 'Stephan' : 'Paul';
  const leaderWins = Math.max(standings.stephanWins, standings.paulWins);
  const loserWins = Math.min(standings.stephanWins, standings.paulWins);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero__content']}>
          <h2 className={styles['hero__season']}>2026</h2>

          <div className={styles['hero__match']}>
            <span className={styles['hero__player']}>STEPHAN</span>
            <span className={styles['hero__vs']}>vs</span>
            <span className={styles['hero__player']}>PAUL</span>
          </div>

          <div className={styles['hero__score']}>
            <span className={styles['hero__number']}>
              {standings.stephanWins}
            </span>
            <span className={styles['hero__separator']}>—</span>
            <span className={styles['hero__number']}>
              {standings.paulWins}
            </span>
          </div>

          <p className={styles['hero__leader']}>
            {leader} LEADS
          </p>

          <p className={styles['hero__target']}>FIRST TO 10</p>

          {/* Progress Bar */}
          <div className={styles['hero__progress']}>
            <div className={styles['hero__progress-bar']}>
              <div
                className={styles['hero__progress-fill']}
                style={{
                  width: `${(leaderWins / 10) * 100}%`,
                }}
              />
            </div>
            <div className={styles['hero__progress-labels']}>
              <span className={styles['hero__progress-label']}>
                STEPHAN {standings.stephanWins}
              </span>
              <span className={styles['hero__progress-label']}>
                PAUL {standings.paulWins}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Recent Rounds */}
      <section className={styles.recent}>
        <h3 className={styles['recent__title']}>RECENT ROUNDS</h3>

        {recentRounds.length === 0 ? (
          <p className={styles['recent__empty']}>
            No rounds yet. Play your first round!
          </p>
        ) : (
          <div className={styles['recent__list']}>
            {recentRounds.map((round) => (
              <div key={round.id} className={styles['recent__card']}>
                <div className={styles['recent__header']}>
                  <h4 className={styles['recent__date']}>
                    {round.playedAt
                      ? new Date(round.playedAt).toLocaleDateString('en-ZA', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Date TBD'}
                  </h4>
                  <span className={styles['recent__status']}>
                    {round.status === 'APPROVED' ? '✓ APPROVED' : 'PENDING'}
                  </span>
                </div>

                {round.courseId ? (
                  <p className={styles['recent__course']}>
                    Course details...
                  </p>
                ) : (
                  <p className={styles['recent__course']}>Course TBD</p>
                )}

                <div className={styles['recent__scores']}>
                  <div className={styles['recent__player']}>
                    <span className={styles['recent__name']}>Stephan</span>
                    <span className={styles['recent__score']}>—</span>
                  </div>
                  <div className={styles['recent__player']}>
                    <span className={styles['recent__name']}>Paul</span>
                    <span className={styles['recent__score']}>—</span>
                  </div>
                </div>

                {round.winnerId && (
                  <p className={styles['recent__winner']}>
                    {round.winnerId === 'stephan' ? 'STEPHAN' : 'PAUL'} WINS
                  </p>
                )}

                <Link
                  href={`/rounds/view?id=${round.id}`}
                  className={styles['recent__link']}
                >
                  View Round
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <p className={styles['cta__text']}>Ready for the next round?</p>
        <Link href="/rounds/new" className={styles['cta__button']}>
          + NEW ROUND
        </Link>
      </section>
    </div>
  );
}
