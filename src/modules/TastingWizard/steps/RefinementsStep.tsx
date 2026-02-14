'use client';

import { Button } from '@/common/components/Button';
import { Slider } from '@/common/components/Slider';
import { cn } from '@/common/functions/cn';
import { useTastingStore } from '@/common/stores/useTastingStore';

const DIET_OPTIONS = [
  { value: 'none', label: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
] as const;

const PREP_TIME_OPTIONS = [
  { value: '<30', label: '<30 min' },
  { value: '30_60', label: '30-60 min' },
  { value: '60_plus', label: '60+ min' },
] as const;

const SPICE_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export function RefinementsStep() {
  const diet = useTastingStore((s) => s.diet);
  const setDiet = useTastingStore((s) => s.setDiet);
  const prepTime = useTastingStore((s) => s.prepTime);
  const setPrepTime = useTastingStore((s) => s.setPrepTime);
  const spiceLevel = useTastingStore((s) => s.spiceLevel);
  const setSpiceLevel = useTastingStore((s) => s.setSpiceLevel);
  const dishBudgetMin = useTastingStore((s) => s.dishBudgetMin);
  const dishBudgetMax = useTastingStore((s) => s.dishBudgetMax);
  const setDishBudgetRange = useTastingStore((s) => s.setDishBudgetRange);
  const nextStep = useTastingStore((s) => s.nextStep);
  const prevStep = useTastingStore((s) => s.prevStep);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Add practical filters
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        We&apos;ll keep dishes realistic for your table, time, and heat preference.
      </p>

      <div className="space-y-s">
        <p className="text-body-s text-text-secondary">Diet</p>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={cn(
                'text-body-xs px-s py-1.5 rounded-full border transition-colors',
                diet === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-secondary',
              )}
              onClick={() => setDiet(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-s mt-m">
        <p className="text-body-s text-text-secondary">Prep time</p>
        <div className="flex flex-wrap gap-2">
          {PREP_TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={cn(
                'text-body-xs px-s py-1.5 rounded-full border transition-colors',
                prepTime === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-secondary',
              )}
              onClick={() => setPrepTime(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-s mt-m">
        <p className="text-body-s text-text-secondary">Spice level</p>
        <div className="flex flex-wrap gap-2">
          {SPICE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={cn(
                'text-body-xs px-s py-1.5 rounded-full border transition-colors',
                spiceLevel === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-secondary',
              )}
              onClick={() => setSpiceLevel(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-m px-xs">
        <p className="text-body-s text-text-secondary mb-xs">Dish budget (USD)</p>
        <Slider
          max={120}
          min={10}
          step={5}
          value={[dishBudgetMin, dishBudgetMax]}
          onValueChange={([min, max]) => setDishBudgetRange(min, max)}
        />
        <div className="flex justify-between mt-xs">
          <span className="text-body-s font-medium text-primary">${dishBudgetMin}</span>
          <span className="text-body-s font-medium text-primary">${dishBudgetMax}</span>
        </div>
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
