'use client';

import { Toaster } from 'sonner';

export function Sonner() {
  return (
    <Toaster
      richColors
      position="top-center"
      toastOptions={{
        style: {
          fontFamily: 'var(--font-body)',
        },
      }}
    />
  );
}
