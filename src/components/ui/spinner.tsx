'use client';

// Adapted from kibo-ui (https://www.kibo-ui.com/components/spinner).
// The upstream "default" variant imports a monorepo-internal shadcn spinner;
// here it falls back to a lucide loader so it resolves in this project.
import {
  LoaderCircleIcon,
  LoaderIcon,
  LoaderPinwheelIcon,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SpinnerVariantProps = Omit<SpinnerProps, 'variant'>;

const Default = ({ className, ...props }: SpinnerVariantProps) => (
  <LoaderCircleIcon className={cn('size-6 animate-spin', className)} {...props} />
);

const Throbber = ({ className, ...props }: SpinnerVariantProps) => (
  <LoaderIcon className={cn('animate-spin', className)} {...props} />
);

const Pinwheel = ({ className, ...props }: SpinnerVariantProps) => (
  <LoaderPinwheelIcon className={cn('animate-spin', className)} {...props} />
);

const CircleFilled = ({
  className,
  size = 24,
  ...props
}: SpinnerVariantProps) => (
  <div className="relative" style={{ width: size, height: size }}>
    <div className="absolute inset-0 rotate-180">
      <LoaderCircleIcon
        className={cn('animate-spin', className, 'text-foreground opacity-20')}
        size={size}
        {...props}
      />
    </div>
    <LoaderCircleIcon
      className={cn('relative animate-spin', className)}
      size={size}
      {...props}
    />
  </div>
);

const Ellipsis = ({ size = 24, ...props }: SpinnerVariantProps) => (
  <svg
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Loading...</title>
    <circle cx="4" cy="12" fill="currentColor" r="2">
      <animate
        attributeName="cy"
        begin="0;ellipsis3.end+0.25s"
        calcMode="spline"
        dur="0.6s"
        id="ellipsis1"
        keySplines=".33,.66,.66,1;.33,0,.66,.33"
        values="12;6;12"
      />
    </circle>
    <circle cx="12" cy="12" fill="currentColor" r="2">
      <animate
        attributeName="cy"
        begin="ellipsis1.begin+0.1s"
        calcMode="spline"
        dur="0.6s"
        keySplines=".33,.66,.66,1;.33,0,.66,.33"
        values="12;6;12"
      />
    </circle>
    <circle cx="20" cy="12" fill="currentColor" r="2">
      <animate
        attributeName="cy"
        begin="ellipsis1.begin+0.2s"
        calcMode="spline"
        dur="0.6s"
        id="ellipsis3"
        keySplines=".33,.66,.66,1;.33,0,.66,.33"
        values="12;6;12"
      />
    </circle>
  </svg>
);

export type SpinnerProps = LucideProps & {
  variant?:
    | 'default'
    | 'throbber'
    | 'pinwheel'
    | 'circle-filled'
    | 'ellipsis';
};

export const Spinner = ({ variant, ...props }: SpinnerProps) => {
  switch (variant) {
    case 'throbber':
      return <Throbber {...props} />;
    case 'pinwheel':
      return <Pinwheel {...props} />;
    case 'circle-filled':
      return <CircleFilled {...props} />;
    case 'ellipsis':
      return <Ellipsis {...props} />;
    default:
      return <Default {...props} />;
  }
};
