'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { AuthDialog } from '@/common/components/AuthDialog';
import { cn } from '@/common/functions/cn';
import { useUserTier } from '@/common/hooks/useTierConfig';

interface UpgradeCTAProps {
  variant?: 'inline' | 'card';
  message: string;
  className?: string;
}

export function UpgradeCTA({
  variant = 'inline',
  message,
  className,
}: UpgradeCTAProps) {
  const tier = useUserTier();
  const [authOpen, setAuthOpen] = useState(false);

  const buttonLabel = tier === 'anonymous' ? 'Sign up free' : 'Upgrade';

  if (variant === 'inline') {
    return (
      <>
        <p className={cn('text-body-xs text-text-muted mt-xs', className)}>
          {message}{' '}
          <button
            className="text-accent font-medium hover:underline"
            onClick={() => setAuthOpen(true)}
          >
            {buttonLabel}
          </button>
        </p>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          'rounded-xl border-2 border-accent/30 bg-accent/5 p-m mt-m',
          className,
        )}
      >
        <div className="flex items-start gap-s">
          <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-body-s text-text-primary font-medium mb-xs">
              {message}
            </p>
            <button
              className="text-body-s text-accent font-medium hover:underline"
              onClick={() => setAuthOpen(true)}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
