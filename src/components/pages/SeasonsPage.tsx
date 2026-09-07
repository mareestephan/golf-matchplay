'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { SEASONS, HISTORICAL_ROUNDS_2025_2026, HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import { calculateSeasonStandings } from '@/lib/calculations';
import styles from './SeasonsPage.module.scss';

export default function SeasonsPage() {
  const standings2026 = useMemo(
    () => calculateSeasonStandings(HISTORICAL_ROUNDS_2026),
    []
  );

  const standings20252026 = useMemo(
    () => calculateSeasonStandings(HISTORICAL_ROUNDS_2025_2026),
    []
  );

  return (
    <div className={styles.page}>
      <div className={styles['page__header']}>
        <h1 className={styles['page__title']}>Seasons</h1>
      </div>

      <div className={styles['page__content']}>
        {/* Current Season */}
        <section className={styles.season}>
          <div className={styles['season__header']}>
            <h2 className={styles['season__name']}>2026</h2>
            <span className={styles['season__status']}>IN PROGRESS</span>
          </div>

          <div className={styles['season__standings']}>
            <div className={styles['standing__item']}>
              <div className={styles['standing__name']}>Stephan Maree</div>
              <div className={styles['standing__wins']}>{standings2026.stephanWins}</div>
            </div>
            <div className={styles['standing__item']}>
              <div className={styles['standing__name']}>Paul Du Plessis</div>
              <div className={styles['standing__wins']}>{standings2026.paulWins}</div>
            </div>
          </div>

          <div className={styles['season__progress']}>
            <p className={styles['season__info']}>First to 10 wins</p>
            <div className={styles['progress-bar']}>
              <div
                className={styles['progress-fill']}
                style={{
                  width: `${(Math.max(standings2026.stephanWins, standings2026.paulWins) / 10) * 100}%`,
                }}
              />
            </div>
          </div>

          <Link href="/rounds" className={styles['season__link']}>
            View Rounds →
          </Link>
        </section>

        {/* Historical Season */}
        <section className={styles.season}>
          <div className={styles['season__header']}>
            <h2 className={styles['season__name']}>2025–2026</h2>
            <span className={styles['season__status']}>COMPLETED</span>
          </div>

          <div className={styles['season__standings']}>
            <div className={`${styles['standing__item']} ${styles['standing__item--winner']}`}>
              <div className={styles['standing__name']}>Paul Du Plessis</div>
              <div className={styles['standing__wins']}>{standings20252026.paulWins}</div>
            </div>
            <div className={styles['standing__item']}>
              <div className={styles['standing__name']}>Stephan Maree</div>
              <div className={styles['standing__wins']}>{standings20252026.stephanWins}</div>
            </div>
          </div>

          <div className={styles['season__result']}>
            <p className={styles['season__winner']}>PAUL WON</p>
          </div>
        </section>
      </div>
    </div>
  );
}
