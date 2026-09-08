'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';
import { getCurrentUser, clearAuthFromStorage } from '@/lib/auth';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import styles from './Header.module.scss';

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'HOME' },
  { href: '/rounds', label: 'ROUNDS' },
  { href: '/seasons', label: 'SEASONS' },
  { href: '/players', label: 'PLAYERS' },
  { href: '/stats', label: 'STATS' },
];

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
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
    <>
      <header className={styles.header}>
        <div className={styles['header__content']}>
       

          {user && (
            <>
              <nav className={styles['header__nav']}>
                <ul className={styles['header__nav-list']}>
                  {NAV_LINKS.map((link) => (
                    <li key={link.href} className={styles['header__nav-item']}>
                      <Link
                        href={link.href}
                        className={`${styles['header__nav-link']} ${
                          pathname === link.href ? styles['header__nav-link--active'] : ''
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className={styles['header__actions']}>
                <Link href="/rounds/new" className={styles['header__new-round']}>
                  + NEW ROUND
                </Link>
                <NotificationCenter />
                <span className={styles['header__name']}>{user.name}</span>
                <button
                  className={styles['header__logout']}
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
