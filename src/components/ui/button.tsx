'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.14em] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-teal text-primary-foreground border border-teal hover:bg-teal-deep hover:border-teal-deep',
        accent:
          'bg-terracotta text-accent-foreground border border-terracotta hover:brightness-95',
        outline:
          'border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
        secondary:
          'border border-border bg-secondary text-secondary-foreground hover:bg-muted',
        ghost:
          'border border-transparent bg-transparent text-ink hover:bg-muted',
        destructive:
          'bg-destructive text-destructive-foreground border border-destructive hover:brightness-95',
        link: 'border-0 text-teal underline-offset-4 hover:underline tracking-normal normal-case',
      },
      size: {
        sm: 'h-8 px-3',
        default: 'h-11 px-6',
        lg: 'h-13 px-8 text-sm',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
