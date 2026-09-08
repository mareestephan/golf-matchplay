'use client';

import { useState, useEffect, useRef } from 'react';
import { Course } from '@/data/courses';
import { useCourses } from '@/hooks/useCourses';
import { getCourseDetails } from '@/lib/golfcourseapi';
import styles from './CourseSelector.module.scss';

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_MS = 500;

interface CourseSelectorProps {
  value: string;
  onChange: (courseId: string) => void;
  onCourseSelect?: (course: Course) => void;
}

export default function CourseSelector({ value, onChange, onCourseSelect }: CourseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { courses: apiCourses, isLoading, searchByName } = useCourses();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCourse = apiCourses.find(c => c.id === value);

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (term.trim().length < MIN_SEARCH_LENGTH) {
      return;
    }

    // Wait for the user to stop typing before firing a single request
    debounceRef.current = setTimeout(() => {
      searchByName(term.trim());
    }, DEBOUNCE_MS);
  };

  // Clear any pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleCourseSelect = async (course: Course) => {
    onChange(course.id);
    setShowSearch(false);
    setSearchTerm('');
    setIsSelecting(true);

    // Fetch full course data (tee boxes, hole data) by ID (logged inside getCourseDetails)
    const fullCourse = await getCourseDetails(course.id);
    setIsSelecting(false);

    if (onCourseSelect) {
      onCourseSelect(fullCourse || course);
    }
  };

  return (
    <div className={styles['course-selector']}>
      <div className={styles['course-selector__header']}>
        <label className={styles['course-selector__label']}>
          Select Course
        </label>
        <button
          type="button"
          className={styles['course-selector__toggle']}
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? '✕ Close' : '🔍 Search'}
        </button>
      </div>

      {showSearch && (
        <div className={styles['course-selector__search']}>
          <input
            type="text"
            className={styles['course-selector__input']}
            placeholder="Search by course name or location..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {isLoading && <p className={styles['course-selector__status']}>Searching...</p>}
          {isSelecting && <p className={styles['course-selector__status']}>Loading course details...</p>}
          {searchTerm.trim().length < MIN_SEARCH_LENGTH && (
            <p className={styles['course-selector__hint']}>
              Type {MIN_SEARCH_LENGTH}+ characters to search
            </p>
          )}
        </div>
      )}

      {showSearch && apiCourses.length > 0 && (
        <div className={styles['course-selector__results']}>
          <div className={styles['course-selector__list']}>
            {apiCourses.map(course => (
              <button
                key={course.id}
                type="button"
                className={`${styles['course-selector__item']} ${
                  value === course.id ? styles['course-selector__item--selected'] : ''
                }`}
                onClick={() => handleCourseSelect(course)}
              >
                <div>
                  <strong>{course.name}</strong>
                  <p>{course.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {value && selectedCourse && (
        <div className={styles['course-selector__details']}>
          <h4>{selectedCourse.name}</h4>
          <p>{selectedCourse.location}</p>
          <p className={styles['course-selector__par']}>Par {selectedCourse.par}</p>
        </div>
      )}
    </div>
  );
}
