'use client';

import { useState, useCallback, useEffect } from 'react';
import { Course } from '@/data/courses';
import { searchCourses, getNearByCourses } from '@/lib/golfcourseapi';

interface UseCoursesOptions {
  searchTerm?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export function useCourses(options: UseCoursesOptions = {}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByName = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCourses([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchCourses(query);
      setCourses(results);
    } catch (err) {
      console.error('useCourses search error:', err);
      setError('Failed to search courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchNearby = useCallback(async (lat: number, lng: number, radius?: number) => {
    console.log('🔄 useCourses: Starting nearby search:', { lat, lng, radius });
    setIsLoading(true);
    setError(null);

    try {
      const results = await getNearByCourses(lat, lng, radius);
      setCourses(results);
    } catch (err) {
      console.error('useCourses nearby search error:', err);
      setError('Failed to find nearby courses');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.searchTerm) {
      searchByName(options.searchTerm);
    } else if (options.latitude && options.longitude) {
      searchNearby(options.latitude, options.longitude, options.radius);
    }
  }, [options.searchTerm, options.latitude, options.longitude, options.radius, searchByName, searchNearby]);

  return {
    courses,
    isLoading,
    error,
    searchByName,
    searchNearby,
  };
}
