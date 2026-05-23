'use client';

// ─────────────────────────────────────────────────────────────────────────────
// useAuth.ts — re-exports from AuthContext + auth mutation hooks
//
// All components use useAuth() for reactive auth state.
// Login/register mutations call context.login() to commit state globally.
// ─────────────────────────────────────────────────────────────────────────────

export { useAuth } from '@/context/AuthContext';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

// ── Register ──────────────────────────────────────────────────────────────────
export function useRegister() {
  const auth = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),
    onSuccess: async ({ token, email, fullName }) => {
      // Commit token to cookie first so the /me call can authenticate
      auth.login(token, {
        id: '',          // temporary — will be overwritten by /me response
        email,
        fullName,
      });
      // Fetch full profile (gets id, phone, bio, etc.)
      await auth.refreshUser();
      router.push('/');
    },
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function useLogin() {
  const auth = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),
    onSuccess: async ({ token, email, fullName }) => {
      // Commit token to cookie first so the /me call can authenticate
      auth.login(token, {
        id: '',
        email,
        fullName,
      });
      // Fetch full profile to get id, phone, bio, etc.
      await auth.refreshUser();
      router.push('/');
    },
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function useLogout() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return () => {
    queryClient.clear(); // clear all cached query data on logout
    auth.logout();
  };
}

// ── Get my profile (from AuthContext — no extra network call needed) ──────────
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// ── Fetch + update profile mutations ─────────────────────────────────────────

export function useProfile() {
  // Profile data lives in AuthContext.user — expose a consistent interface
  const { user, isLoading, refreshUser } = useAuth();
  return {
    data: user ?? undefined,
    isLoading,
    refetch: refreshUser,
  };
}

export function useUpdateProfile() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) =>
      api.put<User>('/api/users/me', data).then((r) => r.data),
    onSuccess: async () => {
      // Re-fetch from server to get canonical data
      await auth.refreshUser();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// ── Stored user (legacy compat) ───────────────────────────────────────────────
export function getStoredUser(): User | null {
  // Kept for any code that imported this — returns null at module level
  // (caller should use useAuth() inside a component instead)
  return null;
}
