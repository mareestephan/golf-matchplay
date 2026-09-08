'use client';

import { useState, useCallback } from 'react';
import { Course } from '@/data/courses';
import { searchCourses, CourseApiError } from '@/lib/golfcourseapi';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchByName = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCourses([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchCourses(query);
      setCourses(results);
    } catch (err) {
      setError(
        err instanceof CourseApiError
          ? err.message
          : 'Something went wrong while searching courses.'
      );
      setCourses([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  const reset = useCallback(() => {
    setCourses([]);
    setError(null);
    setHasSearched(false);
  }, []);

  return { courses, isLoading, error, hasSearched, searchByName, reset };
}
