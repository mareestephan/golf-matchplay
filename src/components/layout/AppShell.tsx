'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import Header from './Header';
import SiteFooter from './SiteFooter';

interface AppShellProps {
  children: React.ReactNode;
  protected?: boolean;
}

export default function AppShell({
  children,
  protected: isProtected = true,
}: AppShellProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Auth is stored client-side, so this guard can only run after mount.
    const user = getCurrentUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(!!user);

    if (isProtected && !user) {
      router.push('/login');
    }
    setIsLoading(false);
  }, [isProtected, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Spinner variant="ellipsis" className="text-teal" size={40} />
        <p className="eyebrow text-muted-foreground">Loading</p>
      </div>
    );
  }

  if (isProtected && !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
