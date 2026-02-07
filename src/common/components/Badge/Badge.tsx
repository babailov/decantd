import { type HTMLAttributes, forwardRef } from 'react';

import { cn } from '@/common/functions/cn';

type BadgeVariant = 'default' | 'red' | 'white' | 'rose' | 'sparkling';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface text-text-primary border border-border',
  red: 'bg-wine-burgundy/10 text-wine-burgundy border border-wine-burgundy/20',
  white: 'bg-wine-goldenrod/10 text-wine-goldenrod border border-wine-goldenrod/20',
  rose: 'bg-pink-100 text-pink-700 border border-pink-200',
  sparkling: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-xs py-0.5 text-body-xs font-medium',
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
export { Badge };
export type { BadgeProps };
