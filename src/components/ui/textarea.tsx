import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-20 w-full border border-input bg-popover px-3.5 py-2.5 text-base text-ink transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:outline-none focus-visible:border-teal focus-visible:ring-1 focus-visible:ring-teal',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
