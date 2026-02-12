'use client';

import { useEffect } from 'react';

import { getMe } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const init = () => {
      const { user, token } = useAuthStore.getState();

      if (!token) {
        setLoading(false);
        return;
      }

      if (user) {
        // Trust hydrated state — show user as signed in immediately
        setAuth(user, token);

        // Background revalidation — only sign out on definitive 401
        getMe()
          .then(({ user: freshUser }) => setAuth(freshUser, token))
          .catch((err: Error & { status?: number }) => {
            if (err?.status === 401) clearAuth();
          });
        return;
      }

      // Token exists but no user — fetch as before
      getMe()
        .then(({ user: freshUser }) => setAuth(freshUser, token))
        .catch(() => clearAuth());
    };

    if (useAuthStore.persist.hasHydrated()) {
      init();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        unsub();
        init();
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
