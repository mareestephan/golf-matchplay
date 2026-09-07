'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { HISTORICAL_ROUNDS_2026 } from '@/data/seedData';
import { COURSES } from '@/data/courses';
import CourseSelector from '@/components/course/CourseSelector';
import styles from './NewRoundPage.module.scss';

interface HoleScores {
  [holeNumber: number]: {
    stephan: number | '';
    paul: number | '';
  };
}

export default function NewRoundPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseId, setCourseId] = useState('cp-estates');
  const [holeScores, setHoleScores] = useState<HoleScores>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const user = getCurrentUser();

  const course = COURSES.find(c => c.id === courseId);
  const totalStephanScore = Object.values(holeScores).reduce((sum, hole) => {
    return sum + (typeof hole.stephan === 'number' ? hole.stephan : 0);
  }, 0);
  const totalPaulScore = Object.values(holeScores).reduce((sum, hole) => {
    return sum + (typeof hole.paul === 'number' ? hole.paul : 0);
  }, 0);

  const handleScoreChange = (holeNumber: number, player: 'stephan' | 'paul', value: string) => {
    setHoleScores(prev => ({
      ...prev,
      [holeNumber]: {
        ...prev[holeNumber],
        [player]: value === '' ? '' : parseInt(value) || '',
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PENDING_APPROVAL' = 'DRAFT') => {
    e.preventDefault();
    setError('');

    // Validate all scores are entered
    if (Object.keys(holeScores).length < 18) {
      setError('Please enter scores for all 18 holes');
      return;
    }

    for (let i = 1; i <= 18; i++) {
      const scores = holeScores[i];
      if (!scores || scores.stephan === '' || scores.paul === '') {
        setError(`Please enter scores for hole ${i}`);
        return;
      }
    }

    if (!date || !courseId) {
      setError('Please select a date and course');
      return;
    }

    setIsLoading(true);

    try {
      // Create new round object
      const newRoundId = `2026-round-${String(HISTORICAL_ROUNDS_2026.length + 1).padStart(2, '0')}`;
      
      const newRound = {
        id: newRoundId,
        seasonId: '2026',
        courseId,
        playedAt: date,
        submittedBy: user?.id || 'stephanmaree',
        approvedBy: null,
        status,
        winnerId: totalStephanScore < totalPaulScore ? 'stephanmaree' : (totalStephanScore > totalPaulScore ? 'pauldueplessis' : null),
        scores: Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          stephan: holeScores[i + 1]?.stephan || 0,
          paul: holeScores[i + 1]?.paul || 0,
          stephanPutts: 0,
          paulPutts: 0,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage for now
      const roundsData = localStorage.getItem('matchplay_rounds');
      const rounds = roundsData ? JSON.parse(roundsData) : [];
      rounds.push(newRound);
      localStorage.setItem('matchplay_rounds', JSON.stringify(rounds));

      // Redirect to round detail or rounds page
      router.push(`/rounds/${newRoundId}`);
    } catch (err) {
      setError('Failed to save round. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles['page__container']}>
        <div className={styles['page__header']}>
          <h1 className={styles['page__title']}>NEW ROUND</h1>
          <p className={styles['page__subtitle']}>Record a new matchplay round</p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'DRAFT')} className={styles['page__form']}>
          {/* Round Details */}
          <div className={styles['page__section']}>
            <h2 className={styles['page__section-title']}>Round Details</h2>
            
            <div className={styles['page__grid']}>
              <div className={styles['page__field']}>
                <label htmlFor="date" className={styles['page__label']}>
                  Date Played
                </label>
                <input
                  id="date"
                  type="date"
                  className={styles['page__input']}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <CourseSelector 
              value={courseId} 
              onChange={setCourseId}
            />
          </div>

          {/* Scorecard */}
          <div className={styles['page__section']}>
            <h2 className={styles['page__section-title']}>Scorecard (18 Holes)</h2>
            
            <div className={styles['page__scorecard']}>
              <table className={styles['page__table']}>
                <thead>
                  <tr>
                    <th className={styles['page__th']}>Hole</th>
                    <th className={styles['page__th']}>Par</th>
                    <th className={styles['page__th']}>Stephan</th>
                    <th className={styles['page__th']}>Paul</th>
                  </tr>
                </thead>
                <tbody>
                  {course?.holes.map(hole => (
                    <tr key={hole.holeNumber}>
                      <td className={styles['page__td']}>{hole.holeNumber}</td>
                      <td className={styles['page__td']}>{hole.par}</td>
                      <td className={styles['page__td']}>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className={styles['page__score-input']}
                          value={holeScores[hole.holeNumber]?.stephan || ''}
                          onChange={(e) => handleScoreChange(hole.holeNumber, 'stephan', e.target.value)}
                          placeholder="—"
                        />
                      </td>
                      <td className={styles['page__td']}>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className={styles['page__score-input']}
                          value={holeScores[hole.holeNumber]?.paul || ''}
                          onChange={(e) => handleScoreChange(hole.holeNumber, 'paul', e.target.value)}
                          placeholder="—"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Score Summary */}
            <div className={styles['page__summary']}>
              <div className={styles['page__summary-item']}>
                <span>Total - Stephan:</span>
                <strong>{totalStephanScore || '—'}</strong>
              </div>
              <div className={styles['page__summary-item']}>
                <span>Total - Paul:</span>
                <strong>{totalPaulScore || '—'}</strong>
              </div>
              {totalStephanScore > 0 && totalPaulScore > 0 && (
                <div className={styles['page__summary-item']}>
                  <span>Leader:</span>
                  <strong className={styles[totalStephanScore < totalPaulScore ? 'page__leader-stephan' : totalStephanScore > totalPaulScore ? 'page__leader-paul' : '']}>
                    {totalStephanScore < totalPaulScore ? 'STEPHAN' : totalStephanScore > totalPaulScore ? 'PAUL' : 'TIED'}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className={styles['page__error']}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className={styles['page__actions']}>
            <button
              type="button"
              className={styles['page__button-secondary']}
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles['page__button']}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              className={styles['page__button-primary']}
              onClick={(e) => handleSubmit(e, 'PENDING_APPROVAL')}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
