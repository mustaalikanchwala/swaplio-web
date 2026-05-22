'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { clearAuth, setStoredUser, setToken, getStoredUser, getToken } from '@/lib/auth';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

// ── Read cached auth from localStorage (client-side only) ────────────────────
export function useCurrentUser(): User | null {
  return typeof window !== 'undefined' ? getStoredUser() : null;
}

export function useIsAuthenticated(): boolean {
  return typeof window !== 'undefined' ? !!getToken() : false;
}

// ── Register ─────────────────────────────────────────────────────────────────
export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),
    onSuccess: ({ token, user }) => {
      setToken(token);
      setStoredUser(user);
      router.push('/');
    },
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),
    onSuccess: ({ token, user }) => {
      setToken(token);
      setStoredUser(user);
      router.push('/');
    },
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function useLogout() {
  const router = useRouter();
  return () => {
    clearAuth();
    router.push('/login');
  };
}

// ── Get my profile ────────────────────────────────────────────────────────────
export function useProfile() {
  return useQuery<User>({
    queryKey: ['profile'],
    queryFn: () => api.get<User>('/api/users/me').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Update profile ────────────────────────────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) =>
      api.put<User>('/api/users/me', data).then((r) => r.data),
    onSuccess: (user) => {
      setStoredUser(user);
      queryClient.setQueryData(['profile'], user);
    },
  });
}
