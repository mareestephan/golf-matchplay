'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { validateCredentials, saveAuthToStorage } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Logo } from '@/components/layout/Logo';
import { Marquee, MarqueeContent, MarqueeItem } from '@/components/ui/marquee';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const user = validateCredentials(username.trim(), password);

    if (user) {
      saveAuthToStorage(user);
      router.push('/');
    } else {
      setError('Those credentials do not match our records.');
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Poster panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-teal p-12 text-paper lg:flex">
        <div className="flex items-center gap-3">
          <Logo className="size-9" />
          <span className="font-display text-lg font-bold uppercase tracking-tight">
            Matchplay
          </span>
        </div>

        <div>
          <p className="eyebrow text-mustard">Season 2026 · First to Ten</p>
          <h1 className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] font-bold uppercase leading-[0.86] tracking-tight">
            Stephan
            <br />
            <span className="text-mustard">versus</span>
            <br />
            Paul
          </h1>
          <p className="mt-8 max-w-sm text-lg leading-relaxed text-paper/75">
            A season-long rivalry played out one round at a time. Every stroke
            recorded, every match decided, every bragging right earned.
          </p>
        </div>

        <div className="-mx-12">
          <Marquee>
            <MarqueeContent speed={40} pauseOnHover={false}>
              {['Matchplay', 'Fairways & Greens', 'First to 10', 'Est. 2025'].map(
                (t, i) => (
                  <MarqueeItem key={i} className="mx-6">
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-paper/50">
                      {t} ·
                    </span>
                  </MarqueeItem>
                )
              )}
            </MarqueeContent>
          </Marquee>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo className="size-8" />
            <span className="font-display text-base font-bold uppercase tracking-tight">
              Matchplay
            </span>
          </div>

          <p className="eyebrow text-terracotta">Members only</p>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-ink">
            Sign in
          </h2>
          <p className="mt-3 text-muted-foreground">
            Enter your credentials to access the clubhouse.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="stephanmaree"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
              />
            </div>

            {error && (
              <div
                role="alert"
                className="border-l-2 border-danger bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner variant="default" className="size-4" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 border-t border-border pt-5 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
            Demo access · usernames{' '}
            <span className="text-ink">stephanmaree</span> or{' '}
            <span className="text-ink">pauldueplessis</span>. Password is the
            registered mobile number.
          </p>
        </div>
      </main>
    </div>
  );
}
