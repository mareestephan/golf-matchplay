'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { getCurrentUser, clearAuthFromStorage } from '@/lib/auth';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import styles from './Header.module.scss';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    clearAuthFromStorage();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles['header__content']}>
        <Link href="/" className={styles['header__logo']}>
          <h1 className={styles['header__title']}>STEPHAN vs PAUL</h1>
        </Link>

        {user && (
          <div className={styles['header__user']}>
            <NotificationCenter />
            <span className={styles['header__name']}>{user.name}</span>
            <button
              className={styles['header__logout']}
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
