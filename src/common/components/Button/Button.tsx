import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/common/functions/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-hover shadow-sm hover:shadow-md',
  secondary:
    'bg-accent text-text-on-accent hover:bg-accent-hover active:bg-accent-hover shadow-sm hover:shadow-md',
  ghost:
    'bg-transparent text-text-primary hover:bg-surface active:bg-surface border border-transparent hover:border-border',
  outline:
    'bg-transparent text-primary border border-primary/70 hover:bg-primary/10 active:bg-primary/15',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-body-s px-s py-1.5 rounded-lg',
  md: 'text-body-m px-m py-xs rounded-xl',
  lg: 'text-body-l px-l py-s rounded-full',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.98]',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="mr-xs inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
