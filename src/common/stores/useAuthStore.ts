import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { User } from '@/common/types/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  isAuthenticated: () => boolean;
}

const useAuthStore = createWithEqualityFn<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      setAuth: (user, token) => set({ user, token, isLoading: false }),
      clearAuth: () => set({ user: null, token: null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),

      isAuthenticated: () => !!get().user && !!get().token,
    }),
    {
      name: 'decantd-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
  shallow,
);

export { useAuthStore };
