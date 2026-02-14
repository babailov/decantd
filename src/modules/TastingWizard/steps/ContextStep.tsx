'use client';

import { Button } from '@/common/components/Button';
import { cn } from '@/common/functions/cn';
import { useTastingStore } from '@/common/stores/useTastingStore';

const GUEST_COUNT_OPTIONS = [
  { value: 'small', label: 'Small table (1-3)' },
  { value: 'medium', label: 'Mid-size (4-8)' },
  { value: 'large', label: 'Large party (9+)' },
] as const;

export function ContextStep() {
  const guestCountBand = useTastingStore((s) => s.guestCountBand);
  const setGuestCountBand = useTastingStore((s) => s.setGuestCountBand);
  const nextStep = useTastingStore((s) => s.nextStep);
  const prevStep = useTastingStore((s) => s.prevStep);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Hosting context
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        We&apos;ll tune dish practicality based on table size.
      </p>

      <div className="space-y-s">
        {GUEST_COUNT_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={cn(
              'w-full text-left rounded-xl border-2 px-s py-xs transition-colors',
              guestCountBand === option.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-surface-elevated',
            )}
            onClick={() => setGuestCountBand(option.value)}
          >
            <p className="text-body-m font-medium text-text-primary">{option.label}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-s mt-l">
        <Button className="flex-1" variant="ghost" onClick={prevStep}>
          Back
        </Button>
        <Button className="flex-1" onClick={nextStep}>
          Continue
        </Button>
      </div>
    </div>
  );
}
