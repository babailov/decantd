'use client';

import { useEffect } from 'react';

import { getMe } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    // Always call getMe() — after OAuth redirect, session cookie is set
    // server-side but Zustand has no token yet
    getMe()
      .then(({ user }) => {
        setAuth(user, token || 'cookie-session');
      })
      .catch(() => {
        if (token) {
          clearAuth();
        } else {
          setLoading(false);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
