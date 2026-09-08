'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Check, AlertCircle } from 'lucide-react';
import { Course } from '@/data/courses';
import { useCourses } from '@/hooks/useCourses';
import { getCourseDetails, CourseApiError } from '@/lib/golfcourseapi';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_MS = 500;

interface CourseSelectorProps {
  value: string;
  onChange: (courseId: string) => void;
  onCourseSelect?: (course: Course) => void;
}

export default function CourseSelector({
  value,
  onChange,
  onCourseSelect,
}: CourseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selected, setSelected] = useState<Course | null>(null);
  const { courses, isLoading, error, hasSearched, searchByName, reset } =
    useCourses();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tooShort = searchTerm.trim().length < MIN_SEARCH_LENGTH;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setDetailError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.trim().length < MIN_SEARCH_LENGTH) {
      reset();
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchByName(term.trim());
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
    reset();
    setDetailError('');
  };

  const handleCourseSelect = async (course: Course) => {
    onChange(course.id);
    setSelected(course);
    setSearchTerm('');
    reset();
    setDetailError('');
    setIsSelecting(true);

    try {
      const fullCourse = await getCourseDetails(course.id);
      onCourseSelect?.(fullCourse);
    } catch (err) {
      // Fall back to the summary course; tee data just won't be available.
      onCourseSelect?.(course);
      setDetailError(
        err instanceof CourseApiError
          ? err.message
          : 'Could not load full course details. Tee data may be missing.'
      );
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Course</Label>

      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          className="h-11 w-full border border-input bg-background pl-10 pr-10 font-sans text-sm text-ink placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          placeholder="Search by course name or town…"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition-colors hover:text-ink"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* States */}
      {searchTerm && tooShort && (
        <p className="font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
          Type {MIN_SEARCH_LENGTH}+ characters to search
        </p>
      )}

      {!tooShort && isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" /> Searching courses…
        </div>
      )}

      {isSelecting && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" /> Loading course details…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && hasSearched && !tooShort && courses.length === 0 && (
        <p className="border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          No courses matched “{searchTerm.trim()}”. Try a different spelling or a
          nearby town.
        </p>
      )}

      {/* Results */}
      {!isLoading && courses.length > 0 && (
        <ul className="max-h-72 divide-y divide-border overflow-y-auto border border-border bg-card">
          {courses.map((course) => (
            <li key={course.id}>
              <button
                type="button"
                onClick={() => handleCourseSelect(course)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted',
                  value === course.id && 'bg-muted'
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm font-semibold text-ink">
                    {course.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {course.location}
                  </span>
                </span>
                {value === course.id && (
                  <Check className="size-4 shrink-0 text-teal" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {detailError && (
        <div className="flex items-start gap-2 border border-mustard/50 bg-mustard/10 p-3 text-sm text-ink">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-mustard" />
          <span>{detailError}</span>
        </div>
      )}

      {/* Selected summary */}
      {value && selected && (
        <div className="flex items-center justify-between border-2 border-teal bg-teal/5 p-4">
          <div className="min-w-0">
            <p className="eyebrow text-teal">Selected Course</p>
            <p className="mt-1 truncate font-display text-base font-semibold text-ink">
              {selected.name}
            </p>
            <p className="text-xs text-muted-foreground">{selected.location}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSelected(null);
            }}
            className="shrink-0 p-1.5 text-muted-foreground transition-colors hover:text-danger"
            aria-label="Remove course"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
