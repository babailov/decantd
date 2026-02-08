'use client';

import { useEffect } from 'react';

import { getMe } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Verify the persisted token is still valid
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
