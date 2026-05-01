import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        localStorage.setItem('swaplio_token', token);
        localStorage.setItem('swaplio_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('swaplio_token');
        localStorage.removeItem('swaplio_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user) => {
        localStorage.setItem('swaplio_user', JSON.stringify(user));
        set({ user });
      },
    }),
    {
      name: 'swaplio-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
