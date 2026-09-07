'use client';

import { useState, useEffect } from 'react';
import { Course, COURSES } from '@/data/courses';
import { useCourses } from '@/hooks/useCourses';
import styles from './CourseSelector.module.scss';

interface CourseSelectorProps {
  value: string;
  onChange: (courseId: string) => void;
  onCourseSelect?: (course: Course) => void;
}

export default function CourseSelector({ value, onChange, onCourseSelect }: CourseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { courses: apiCourses, isLoading, searchByName } = useCourses();

  // Combine hardcoded and API courses
  const allCourses = [...COURSES, ...apiCourses];
  const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values());

  const selectedCourse = uniqueCourses.find(c => c.id === value);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim().length > 2) {
      setIsSearching(true);
      await searchByName(term);
      setIsSearching(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    onChange(course.id);
    setShowSearch(false);
    setSearchTerm('');
    if (onCourseSelect) {
      onCourseSelect(course);
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
          {searchTerm.length <= 2 && (
            <p className={styles['course-selector__hint']}>
              Type 3+ characters to search
            </p>
          )}
        </div>
      )}

      {showSearch && apiCourses.length > 0 && (
        <div className={styles['course-selector__results']}>
          <p className={styles['course-selector__label']}>API Results</p>
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

      <div className={styles['course-selector__main']}>
        <p className={styles['course-selector__label']}>Featured Courses</p>
        <select
          className={styles['course-selector__select']}
          value={value}
          onChange={(e) => {
            const course = uniqueCourses.find(c => c.id === e.target.value);
            if (course) {
              handleCourseSelect(course);
            }
          }}
        >
          <option value="">Select a course...</option>
          {COURSES.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.location})
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className={styles['course-selector__details']}>
          <h4>{selectedCourse.name}</h4>
          <p>{selectedCourse.location}</p>
          <p className={styles['course-selector__par']}>Par {selectedCourse.par}</p>
        </div>
      )}
    </div>
  );
}
