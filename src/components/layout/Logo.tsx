import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn('size-8', className)}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="15"
        className="fill-paper stroke-ink"
        strokeWidth="1.5"
      />
      <line
        x1="16"
        y1="16"
        x2="16"
        y2="4.5"
        className="stroke-ink"
        strokeWidth="1.5"
      />
      <path d="M16 4.5 L26 7.5 L16 10.5 Z" className="fill-terracotta" />
      <circle cx="16" cy="16" r="2.75" className="fill-teal" />
    </svg>
  );
}
