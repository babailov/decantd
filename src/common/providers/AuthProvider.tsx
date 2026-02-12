'use client';

import { useEffect } from 'react';

import { getMe } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const verify = () => {
      const { token } = useAuthStore.getState();
      if (!token) {
        setLoading(false);
        return;
      }
      getMe()
        .then(({ user }) => setAuth(user, token))
        .catch(() => clearAuth());
    };

    if (useAuthStore.persist.hasHydrated()) {
      verify();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        unsub();
        verify();
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
