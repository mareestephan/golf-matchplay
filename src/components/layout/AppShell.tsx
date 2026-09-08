'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Header from './Header';
import styles from './AppShell.module.scss';

interface AppShellProps {
  children: React.ReactNode;
  protected?: boolean;
}

export default function AppShell({ children, protected: isProtected = true }: AppShellProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);

    if (isProtected && !user) {
      router.push('/login');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isProtected, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isProtected && !isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles['shell__main']}>
        <div className={styles['shell__content']}>
          {children}
        </div>
      </main>
    </div>
  );
}
