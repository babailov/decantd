import { type InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/common/functions/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-body-s font-medium text-text-secondary" htmlFor={id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-surface-elevated px-s py-xs text-body-m text-text-primary',
            'placeholder:text-text-muted',
            'transition-colors',
            error ? 'border-alert' : 'border-border focus:border-primary',
            className,
          )}
          id={id}
          {...props}
        />
        {error && (
          <span className="text-body-xs text-alert">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input };
export type { InputProps };
