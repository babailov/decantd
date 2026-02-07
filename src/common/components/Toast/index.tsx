'use client';

import { Toaster } from 'sonner';

export function Sonner() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        style: {
          fontFamily: 'var(--font-body)',
        },
      }}
    />
  );
}
