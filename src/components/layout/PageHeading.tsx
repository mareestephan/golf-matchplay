import { cn } from '@/lib/utils';

interface PageHeadingProps {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeading({
  index,
  eyebrow,
  title,
  description,
  action,
  className,
}: PageHeadingProps) {
  return (
    <header className={cn('mb-10 border-t-2 border-ink pt-4 lg:mb-14', className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow flex items-center gap-2 text-terracotta">
            <span>{index}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-ink">{eyebrow}</span>
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4.25rem)] font-bold uppercase leading-[0.92] tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
