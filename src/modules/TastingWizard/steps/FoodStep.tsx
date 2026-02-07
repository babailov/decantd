'use client';

import { motion } from 'motion/react';

import { Button } from '@/common/components/Button';
import { Input } from '@/common/components/Input';
import { cn } from '@/common/functions/cn';
import { useTastingStore } from '@/common/stores/useTastingStore';

const FOOD_SUGGESTIONS = [
  'Steak & grilled meats',
  'Pasta & Italian',
  'Seafood & fish',
  'Cheese board',
  'Sushi & Japanese',
  'Pizza',
  'Charcuterie',
  'Vegetarian',
  'Spicy / Thai / Indian',
  'Desserts & chocolate',
  'No food — wine only',
];

export function FoodStep() {
  const foodPairing = useTastingStore((s) => s.foodPairing);
  const setFoodPairing = useTastingStore((s) => s.setFoodPairing);
  const nextStep = useTastingStore((s) => s.nextStep);
  const prevStep = useTastingStore((s) => s.prevStep);

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        What are you eating?
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        We&apos;ll pick wines that pair beautifully with your food.
      </p>

      <Input
        id="food-pairing"
        placeholder="E.g., grilled salmon with herbs..."
        value={foodPairing}
        onChange={(e) => setFoodPairing(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mt-m">
        {FOOD_SUGGESTIONS.map((suggestion, i) => (
          <motion.button
            key={suggestion}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'text-body-xs px-s py-1.5 rounded-full border transition-colors',
              foodPairing === suggestion
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-elevated text-text-secondary hover:border-primary/30',
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            onClick={() => setFoodPairing(suggestion)}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-s mt-l">
        <Button className="flex-1" variant="ghost" onClick={prevStep}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!foodPairing.trim()}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
