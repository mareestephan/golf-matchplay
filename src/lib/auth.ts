import { User, AuthState } from '@/types';

// Hardcoded credentials for now - in production this would be Supabase
const VALID_USERS = [
  {
    id: 'stephan',
    name: 'Stephan Maree',
    phone: '0826595953',
    username: 'stephanmaree',
    password: '0826595953',
    role: 'admin' as const,
  },
  {
    id: 'paul',
    name: 'Paul Du Plessis',
    phone: '0722189584',
    username: 'pauldueplessis',
    password: '0722189584',
    role: 'player' as const,
  },
];

const AUTH_KEY = 'matchplay_auth';

export function validateCredentials(
  username: string,
  password: string
): User | null {
  const user = VALID_USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function saveAuthToStorage(user: User): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuthFromStorage(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearAuthFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthFromStorage() !== null;
}

export function getCurrentUser(): User | null {
  return getAuthFromStorage();
}
