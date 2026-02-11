import { type HTMLAttributes, forwardRef } from 'react';

import { cn } from '@/common/functions/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-m border border-border/70',
          variant === 'default' && 'bg-surface',
          variant === 'elevated' && 'bg-surface-elevated shadow-md border-border-strong/65',
          variant === 'outlined' && 'bg-surface-elevated border-border-strong',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
export { Card };
export type { CardProps };
