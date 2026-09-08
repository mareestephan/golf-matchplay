'use client';

import { useState, useEffect } from 'react';
import { Course, TeeBox } from '@/data/courses';
import styles from './TeeSelector.module.scss';

interface TeeSelectorProps {
  course: Course;
  onTeeSelect: (tee: TeeBox) => void;
}
export default function TeeSelector({ course, onTeeSelect }: TeeSelectorProps) {
  
    const teeBoxes = course.teeBoxes || [];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset selection when the course changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [course.id]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onTeeSelect(teeBoxes[index]);
  };

  if (teeBoxes.length === 0) {
    return (
      <div className={styles['tee-selector']}>
        <p className={styles['tee-selector__empty']}>
          No tee box data available for this course.
        </p>
      </div>
    );
  }

  return (
    <div className={styles['tee-selector']}>
      <div className={styles['tee-selector__header']}>
        <label className={styles['tee-selector__label']}>
          Select Tees
        </label>
      </div>

      <div className={styles['tee-selector__options']}>
        {teeBoxes.map((tee, index) => (
          <button
            key={`${tee.gender}-${tee.teeName}-${index}`}
            type="button"
            className={`${styles['tee-selector__button']} ${
              selectedIndex === index ? styles['tee-selector__button--active'] : ''
            }`}
            onClick={() => handleSelect(index)}
          >
            <span className={styles['tee-selector__name']}>{tee.teeName}</span>
            <span className={styles['tee-selector__gender']}>{tee.gender}</span>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className={styles['tee-selector__details']}>
          {teeBoxes[selectedIndex].parTotal && (
            <span>Par {teeBoxes[selectedIndex].parTotal}</span>
          )}
          {teeBoxes[selectedIndex].totalYards && (
            <span>{teeBoxes[selectedIndex].totalYards} yards</span>
          )}
          {teeBoxes[selectedIndex].courseRating && (
            <span>Rating {teeBoxes[selectedIndex].courseRating}</span>
          )}
          {teeBoxes[selectedIndex].slopeRating && (
            <span>Slope {teeBoxes[selectedIndex].slopeRating}</span>
          )}
        </div>
      )}
    </div>
  );
}
