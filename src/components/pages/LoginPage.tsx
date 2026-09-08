'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateCredentials, saveAuthToStorage } from '@/lib/auth';
import styles from './LoginPage.module.scss';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const user = validateCredentials(username, password);

    if (user) {
      saveAuthToStorage(user);
      router.push('/');
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles['page__container']}>
        <div className={styles['page__card']}>
    

          <form onSubmit={handleSubmit} className={styles['page__form']}>
            <div className={styles['page__field']}>
              <label htmlFor="username" className={styles['page__label']}>
                Username
              </label>
              <input
                id="username"
                type="text"
                className={styles['page__input']}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>

            <div className={styles['page__field']}>
              <label htmlFor="password" className={styles['page__label']}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className={styles['page__input']}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>

            {error && (
              <div className={styles['page__error']}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles['page__button']}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
