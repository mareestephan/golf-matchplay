import Link from 'next/link';
import { Logo } from './Logo';

export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <div className="flex items-center gap-3">
          <Logo className="size-7" />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold uppercase tracking-tight">
              Matchplay
            </p>
            <p className="eyebrow text-muted-foreground">Stephan × Paul</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/rounds"
            className="eyebrow text-muted-foreground transition-colors hover:text-ink"
          >
            Rounds
          </Link>
          <Link
            href="/seasons"
            className="eyebrow text-muted-foreground transition-colors hover:text-ink"
          >
            Seasons
          </Link>
          <Link
            href="/players"
            className="eyebrow text-muted-foreground transition-colors hover:text-ink"
          >
            Players
          </Link>
          <Link
            href="/stats"
            className="eyebrow text-muted-foreground transition-colors hover:text-ink"
          >
            Stats
          </Link>
        </nav>

        <p className="eyebrow text-muted-foreground">
          First to 10 · Est. 2025
        </p>
      </div>
    </footer>
  );
}
