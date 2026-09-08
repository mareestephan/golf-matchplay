'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Course, TeeBox } from '@/data/courses';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TeeSelectorProps {
  course: Course;
  onTeeSelect: (tee: TeeBox) => void;
}

const GENDER_LABEL: Record<string, string> = {
  male: "Men's",
  female: "Women's",
  mens: "Men's",
  womens: "Women's",
};

function formatGender(gender: string): string {
  return GENDER_LABEL[gender.toLowerCase()] ?? gender;
}

export default function TeeSelector({ course, onTeeSelect }: TeeSelectorProps) {
  const teeBoxes = course.teeBoxes || [];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [prevCourseId, setPrevCourseId] = useState(course.id);

  // Reset selection when the course changes (render-phase, per React guidance).
  if (course.id !== prevCourseId) {
    setPrevCourseId(course.id);
    setSelectedIndex(null);
  }

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onTeeSelect(teeBoxes[index]);
  };

  if (teeBoxes.length === 0) {
    return (
      <div className="space-y-3">
        <Label>Tees</Label>
        <p className="border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          No tee box data is available for this course — the standard 18-hole
          scorecard will be used.
        </p>
      </div>
    );
  }

  const active = selectedIndex !== null ? teeBoxes[selectedIndex] : null;

  return (
    <div className="space-y-3">
      <Label>Tees</Label>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {teeBoxes.map((tee, index) => (
          <button
            key={`${tee.gender}-${tee.teeName}-${index}`}
            type="button"
            onClick={() => handleSelect(index)}
            className={cn(
              'flex flex-col items-start border p-3 text-left transition-colors',
              selectedIndex === index
                ? 'border-teal bg-teal text-paper'
                : 'border-input bg-background text-ink hover:bg-muted'
            )}
          >
            <span className="flex w-full items-center justify-between font-display text-sm font-semibold">
              {tee.teeName}
              {selectedIndex === index && <Check className="size-3.5" />}
            </span>
            <span
              className={cn(
                'mt-0.5 font-mono text-[0.625rem] uppercase tracking-wide',
                selectedIndex === index ? 'text-paper/70' : 'text-muted-foreground'
              )}
            >
              {formatGender(tee.gender)}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
          {active.parTotal && (
            <span>
              Par <strong className="text-ink">{active.parTotal}</strong>
            </span>
          )}
          {active.totalYards && (
            <span>
              <strong className="text-ink">{active.totalYards}</strong> yds
            </span>
          )}
          {active.courseRating && (
            <span>
              Rating <strong className="text-ink">{active.courseRating}</strong>
            </span>
          )}
          {active.slopeRating && (
            <span>
              Slope <strong className="text-ink">{active.slopeRating}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
