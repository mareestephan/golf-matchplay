import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 border font-mono text-[0.625rem] font-bold uppercase tracking-[0.14em] px-2 py-0.5 leading-none',
  {
    variants: {
      variant: {
        default: 'border-ink bg-ink text-paper',
        teal: 'border-teal bg-teal text-primary-foreground',
        outline: 'border-border bg-transparent text-muted-foreground',
        terracotta: 'border-terracotta bg-terracotta text-accent-foreground',
        mustard: 'border-mustard bg-mustard text-ink',
        success: 'border-success bg-transparent text-success',
        muted: 'border-border bg-secondary text-secondary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
