'use client';

import { useMemo } from 'react';
import { Round } from '@/types';
import {
  calculateSeasonStandings,
  calculateAverageScore,
  calculateAveragePutts,
  calculateGirPercentage,
  calculateFairwayPercentage,
  getBestScore,
  getWorstScore,
  getCurrentWinningStreak,
} from '@/lib/calculations';
import styles from './StatsPage.module.scss';

interface StatsPageProps {
  rounds: Round[];
  playerId: string;
  playerName: string;
}

export default function StatsPage({ rounds, playerId, playerName }: StatsPageProps) {
  const playerRounds = useMemo(
    () => rounds.filter(r => r.scores?.some(s => s.playerId === playerId)),
    [rounds, playerId]
  );

  const stats = useMemo(() => ({
    avgScore: calculateAverageScore(playerRounds, playerId),
    bestScore: getBestScore(playerRounds, playerId),
    worstScore: getWorstScore(playerRounds, playerId),
    avgPutts: calculateAveragePutts(playerRounds, playerId),
    girPct: calculateGirPercentage(playerRounds, playerId),
    fairwayPct: calculateFairwayPercentage(playerRounds, playerId),
    winStreak: getCurrentWinningStreak(playerRounds, playerId),
    roundsPlayed: playerRounds.length,
  }), [playerRounds, playerId]);

  return (
    <div className={styles['stats']}>
      <div className={styles['stats__header']}>
        <h1 className={styles['stats__title']}>{playerName} - Advanced Stats</h1>
        <p className={styles['stats__subtitle']}>Detailed performance analytics</p>
      </div>

      <div className={styles['stats__grid']}>
        {/* Primary Stats */}
        <StatCard
          title="Rounds Played"
          value={stats.roundsPlayed}
          icon="🏌️"
          trend={stats.roundsPlayed > 0 ? 'positive' : 'neutral'}
        />

        <StatCard
          title="Average Score"
          value={stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '—'}
          subtitle="Lower is better"
          icon="📊"
          trend={stats.avgScore > 0 ? (stats.avgScore < 72 ? 'positive' : 'neutral') : 'neutral'}
        />

        <StatCard
          title="Best Score"
          value={stats.bestScore || '—'}
          icon="⭐"
          trend="positive"
        />

        <StatCard
          title="Worst Score"
          value={stats.worstScore || '—'}
          icon="📉"
          trend="neutral"
        />

        {/* Advanced Stats */}
        <StatCard
          title="Average Putts"
          value={stats.avgPutts > 0 ? stats.avgPutts.toFixed(2) : '—'}
          subtitle="Per round"
          icon="🎯"
          trend={stats.avgPutts > 0 ? (stats.avgPutts < 32 ? 'positive' : 'neutral') : 'neutral'}
        />

        <StatCard
          title="GIR %"
          value={stats.girPct > 0 ? stats.girPct.toFixed(1) + '%' : '—'}
          subtitle="Greens in regulation"
          icon="🚩"
          trend={stats.girPct > 0 ? (stats.girPct > 50 ? 'positive' : 'neutral') : 'neutral'}
        />

        <StatCard
          title="Fairway %"
          value={stats.fairwayPct > 0 ? stats.fairwayPct.toFixed(1) + '%' : '—'}
          subtitle="Off the tee accuracy"
          icon="🎲"
          trend={stats.fairwayPct > 0 ? (stats.fairwayPct > 60 ? 'positive' : 'neutral') : 'neutral'}
        />

        <StatCard
          title="Win Streak"
          value={stats.winStreak}
          subtitle="Consecutive wins"
          icon="🔥"
          trend={stats.winStreak > 0 ? 'positive' : 'neutral'}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className={styles['stats__breakdown']}>
        <h2 className={styles['stats__section-title']}>Performance Breakdown</h2>
        
        <div className={styles['stats__chart-grid']}>
          <div className={styles['stats__chart']}>
            <h3>Score Distribution</h3>
            <ScoreChart rounds={playerRounds} />
          </div>

          <div className={styles['stats__chart']}>
            <h3>Win/Loss Record</h3>
            <WinLossChart rounds={playerRounds} playerId={playerId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className={`${styles['stat-card']} ${styles[`stat-card--${trend}`]}`}>
      <div className={styles['stat-card__icon']}>{icon}</div>
      <div className={styles['stat-card__content']}>
        <p className={styles['stat-card__title']}>{title}</p>
        <p className={styles['stat-card__value']}>{value}</p>
        {subtitle && <p className={styles['stat-card__subtitle']}>{subtitle}</p>}
      </div>
    </div>
  );
}

function ScoreChart({ rounds }: { rounds: Round[] }) {
  const scores = rounds.flatMap(r => r.scores || []).map(s => s.score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;

  return (
    <div className={styles['simple-chart']}>
      <p className={styles['chart-stat']}>
        Average: <strong>{avgScore}</strong> strokes
      </p>
      <div className={styles['chart-bar-grid']}>
        {[...Array(9)].map((_, i) => {
          const min = 65 + i * 3;
          const max = min + 3;
          const count = scores.filter(s => s >= min && s < max).length;
          const height = count > 0 ? Math.max(20, (count / scores.length) * 100) : 5;
          return (
            <div key={i} className={styles['chart-bar-item']}>
              <div
                className={styles['chart-bar']}
                style={{
                  height: `${height}%`,
                  background: height > 50 ? '#4CAF50' : height > 30 ? '#FFA500' : '#B43535',
                }}
              />
              <span className={styles['chart-label']}>{min}-{max}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WinLossChart({ rounds, playerId }: { rounds: Round[]; playerId: string }) {
  const wins = rounds.filter(r => r.winnerId === playerId).length;
  const losses = rounds.filter(r => r.winnerId && r.winnerId !== playerId).length;
  const total = wins + losses;
  const winPct = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';

  return (
    <div className={styles['simple-chart']}>
      <div className={styles['record']}>
        <div className={styles['record-item']}>
          <span className={styles['record-label']}>Wins</span>
          <span className={styles['record-value']}>{wins}</span>
        </div>
        <div className={styles['record-item']}>
          <span className={styles['record-label']}>Losses</span>
          <span className={styles['record-value']}>{losses}</span>
        </div>
      </div>
      <div className={styles['win-pct']}>Win Rate: <strong>{winPct}%</strong></div>
    </div>
  );
}
