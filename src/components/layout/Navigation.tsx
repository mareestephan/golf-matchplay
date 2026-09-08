'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Navigation.module.scss';

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

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles['nav__content']}>
        <ul className={styles['nav__list']}>
          {NAV_LINKS.map((link) => (
            <li key={link.href} className={styles['nav__item']}>
              <Link
                href={link.href}
                className={`${styles['nav__link']} ${
                  pathname === link.href ? styles['nav__link--active'] : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/rounds/new" className={styles['nav__button']}>
          + NEW ROUND
        </Link>
      </div>
    </nav>
  );
}
