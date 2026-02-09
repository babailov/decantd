import { Suspense } from 'react';

import { ResetPasswordForm } from '@/modules/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-s">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-xl">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
