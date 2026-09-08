'use client';

import { useMemo } from 'react';
import { HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import {
  calculateAverageScore,
  getBestScore,
  getWorstScore,
  calculateAveragePutts,
  calculateGirPercentage,
  calculateFairwayPercentage,
} from '@/lib/calculations';
import styles from './PlayersPage.module.scss';

const STEPHAN_ID = 'stephan';
const PAUL_ID = 'paul';

const PLAYERS = [
  {
    id: STEPHAN_ID,
    name: 'Stephan Maree',
    phone: '0826595953',
  },
  {
    id: PAUL_ID,
    name: 'Paul Du Plessis',
    phone: '0722189584',
  },
];

export default function PlayersPage() {
  const stats = useMemo(() => {
    return PLAYERS.map((player) => ({
      ...player,
      avgScore: calculateAverageScore(HISTORICAL_ROUNDS_2026, player.id),
      bestScore: getBestScore(HISTORICAL_ROUNDS_2026, player.id),
      worstScore: getWorstScore(HISTORICAL_ROUNDS_2026, player.id),
      avgPutts: calculateAveragePutts(HISTORICAL_ROUNDS_2026, player.id),
      girPercentage: calculateGirPercentage(HISTORICAL_ROUNDS_2026, player.id),
      fairwayPercentage: calculateFairwayPercentage(HISTORICAL_ROUNDS_2026, player.id),
      roundsPlayed: HISTORICAL_ROUNDS_2026.length,
    }));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles['page__header']}>
        <h1 className={styles['page__title']}>Players</h1>
      </div>

      <div className={styles['page__content']}>
        {stats.map((player) => (
          <section key={player.id} className={styles.card}>
            <div className={styles['card__header']}>
              <h2 className={styles['card__name']}>{player.name}</h2>
              <p className={styles['card__phone']}>{player.phone}</p>
            </div>

            <div className={styles['card__stats']}>
              {player.avgScore > 0 && (
                <div className={styles['stat']}>
                  <span className={styles['stat__label']}>Average Score</span>
                  <span className={styles['stat__value']}>
                    {player.avgScore.toFixed(1)}
                  </span>
                </div>
              )}

              {player.bestScore && (
                <div className={styles['stat']}>
                  <span className={styles['stat__label']}>Best Score</span>
                  <span className={styles['stat__value']}>
                    {player.bestScore}
                  </span>
                </div>
              )}

              {player.worstScore && (
                <div className={styles['stat']}>
                  <span className={styles['stat__label']}>Worst Score</span>
                  <span className={styles['stat__value']}>
                    {player.worstScore}
                  </span>
                </div>
              )}

              {player.avgPutts > 0 && (
                <div className={styles['stat']}>
                  <span className={styles['stat__label']}>Avg Putts</span>
                  <span className={styles['stat__value']}>
                    {player.avgPutts.toFixed(1)}
                  </span>
                </div>
              )}

              {player.girPercentage > 0 && (
                <div className={styles['stat']}>
                  <span className={styles['stat__label']}>GIR %</span>
                  <span className={styles['stat__value']}>
                    {player.girPercentage.toFixed(0)}%
                  </span>
                </div>
              )}

              {player.fairwayPercentage > 0 && (
                <div className={styles['stat']}>
                  <span className={styles['stat__label']}>Fairway %</span>
                  <span className={styles['stat__value']}>
                    {player.fairwayPercentage.toFixed(0)}%
                  </span>
                </div>
              )}

              <div className={styles['stat']}>
                <span className={styles['stat__label']}>Rounds Played</span>
                <span className={styles['stat__value']}>
                  {player.roundsPlayed}
                </span>
              </div>
            </div>

          </section>
        ))}
      </div>
    </div>
  );
}
