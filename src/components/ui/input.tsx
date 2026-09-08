import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full border border-input bg-popover px-3.5 py-2 text-base text-ink transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:outline-none focus-visible:border-teal focus-visible:ring-1 focus-visible:ring-teal',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  );
}

export { Input };
