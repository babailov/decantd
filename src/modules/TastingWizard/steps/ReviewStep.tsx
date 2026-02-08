'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { queryKeys } from '@/common/constants/queryKeys';
import { OCCASIONS, POPULAR_REGIONS } from '@/common/constants/wine.const';
import { generateTastingPlan } from '@/common/services/tasting-api';
import { useTastingStore } from '@/common/stores/useTastingStore';

export function ReviewStep() {
  const {
    occasion,
    foodPairing,
    regionPreferences,
    surpriseMe,
    budgetMin,
    budgetMax,
    wineCount,
    isGenerating,
    setIsGenerating,
    setGeneratedPlan,
    setGenerationError,
    prevStep,
  } = useTastingStore();

  const router = useRouter();
  const queryClient = useQueryClient();

  const occasionLabel =
    OCCASIONS.find((o) => o.value === occasion)?.label || occasion;
  const regionLabels = regionPreferences.map(
    (r) => POPULAR_REGIONS.find((pr) => pr.value === r)?.label || r,
  );

  const handleGenerate = async () => {
    if (!occasion) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const plan = await generateTastingPlan({
        occasion,
        foodPairing,
        regionPreferences,
        budgetMin,
        budgetMax,
        budgetCurrency: 'USD',
        wineCount,
      });

      setGeneratedPlan(plan);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.plans });
      router.push(`/tasting/${plan.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setGenerationError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const summaryItems = [
    { label: 'Occasion', value: occasionLabel },
    { label: 'Food', value: foodPairing || 'Not specified' },
    {
      label: 'Regions',
      value: surpriseMe ? 'Surprise me!' : regionLabels.join(', '),
    },
    { label: 'Budget', value: `$${budgetMin}–$${budgetMax} per bottle` },
    {
      label: 'Wines',
      value: `${wineCount} ${wineCount === 1 ? 'wine' : 'wines'}`,
    },
  ];

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        Your Tasting Plan
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        Review your selections before we craft your personalized plan.
      </p>

      <Card variant="outlined">
        <div className="flex flex-col gap-s">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex justify-between items-start">
              <span className="text-body-s text-text-muted">{item.label}</span>
              <span className="text-body-s font-medium text-text-primary text-right max-w-[60%]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-s mt-l">
        <Button
          className="flex-1"
          disabled={isGenerating}
          variant="ghost"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          className="flex-1 gap-xs"
          disabled={isGenerating}
          loading={isGenerating}
          onClick={handleGenerate}
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Generate My Plan'}
        </Button>
      </div>
    </div>
  );
}
