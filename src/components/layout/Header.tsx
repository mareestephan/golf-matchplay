'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Plus, LogOut } from 'lucide-react';
import { User } from '@/types';
import { getCurrentUser, clearAuthFromStorage } from '@/lib/auth';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/rounds', label: 'Rounds' },
  { href: '/seasons', label: 'Seasons' },
  { href: '/players', label: 'Players' },
  { href: '/stats', label: 'Stats' },
];

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Auth lives in localStorage, so it can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearAuthFromStorage();
    setUser(null);
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <Logo className="size-8 transition-transform duration-200 group-hover:-rotate-6" />
          <div className="leading-none">
            <p className="font-display text-base font-extrabold uppercase tracking-tight text-ink">
              Matchplay
            </p>
            <p className="eyebrow mt-1 text-teal">Stephan × Paul</p>
          </div>
        </Link>

        {user && (
          <>
            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors',
                    isActive(link.href)
                      ? 'text-ink'
                      : 'text-muted-foreground hover:text-ink'
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-terracotta" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild size="sm" variant="accent">
                <Link href="/rounds/new">
                  <Plus className="size-4" />
                  New Round
                </Link>
              </Button>
              <NotificationCenter />
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wide text-ink">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="grid size-9 place-items-center border border-border text-muted-foreground transition-colors hover:border-ink hover:text-ink"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <NotificationCenter />
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="grid size-10 place-items-center border border-ink text-ink"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex w-full max-w-[1440px] flex-col px-5 py-2 sm:px-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center justify-between border-b border-border/60 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.14em]',
                  isActive(link.href) ? 'text-terracotta' : 'text-ink'
                )}
              >
                {link.label}
                {isActive(link.href) && <span className="size-2 bg-terracotta" />}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-3 py-4">
              <Button asChild variant="accent" className="flex-1">
                <Link href="/rounds/new">
                  <Plus className="size-4" />
                  New Round
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
