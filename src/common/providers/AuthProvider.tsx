'use client';

import { useEffect } from 'react';

import { getMe } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    // Skip network request if no token — OAuth callback now writes
    // token + user to localStorage before redirecting (see d682354)
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(({ user }) => {
        setAuth(user, token);
      })
      .catch(() => {
        clearAuth();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
