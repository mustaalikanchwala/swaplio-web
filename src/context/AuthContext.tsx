'use client';

// ─────────────────────────────────────────────────────────────────────────────
// AuthContext — global, reactive auth state.
//
// Provides:
//   user          — the authenticated User (or null)
//   isLoading     — true while the startup session-restore is in flight
//   isAuthenticated — derived boolean
//   login()       — store token + user, expose state
//   logout()      — clear token + user, redirect to /login
//
// Mounted once in Providers. All components subscribe via useAuth().
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getToken, setToken, clearAuth } from '@/lib/auth';
import type { User } from '@/types';

// ── Shape ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // start true — restoring session

  // ── Restore session on mount ──────────────────────────────────────────────
  // Reads token from cookie → calls /api/users/me → hydrates user state.
  // If the token is missing or invalid the endpoint returns 401 and we clear.

  const restoreSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get<User>('/api/users/me');
      setUser(data);
    } catch {
      // Token is expired or invalid — wipe it
      clearAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback((token: string, userPayload: User) => {
    setToken(token);
    setUser(userPayload);
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/login');
  }, [router]);

  // ── refreshUser (re-fetch profile from server) ────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>('/api/users/me');
      setUser(data);
    } catch {
      /* silently ignore — 401 interceptor will handle expired tokens */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
