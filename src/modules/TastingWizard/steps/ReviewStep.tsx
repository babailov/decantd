'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { UpgradeCTA } from '@/common/components/UpgradeCTA';
import { queryKeys } from '@/common/constants/queryKeys';
import { OCCASIONS, POPULAR_REGIONS } from '@/common/constants/wine.const';
import { copy } from '@/common/content';
import { cn } from '@/common/functions/cn';
import { useTierConfig, useUserTier } from '@/common/hooks/useTierConfig';
import { trackEvent } from '@/common/services/analytics-api';
import { generateTastingPlan, getGenerationStatus } from '@/common/services/tasting-api';
import { usePlanHistoryStore } from '@/common/stores/usePlanHistoryStore';
import { useTastingGenerationToastStore } from '@/common/stores/useTastingGenerationToastStore';
import { useTastingStore } from '@/common/stores/useTastingStore';
import { TastingPlanInput } from '@/common/types/tasting';

export function ReviewStep() {
  const {
    mode,
    occasion,
    foodPairing,
    regionPreferences,
    surpriseMe,
    budgetMin,
    budgetMax,
    wineCount,
    specialRequest,
    setSpecialRequest,
    wineInputType,
    wineInputValue,
    diet,
    prepTime,
    spiceLevel,
    dishBudgetMin,
    dishBudgetMax,
    cuisinePreferences,
    guestCountBand,
    isGenerating,
    setIsGenerating,
    setGeneratedPlan,
    setGenerationError,
    resetWizard,
    prevStep,
  } = useTastingStore();

  const router = useRouter();
  const queryClient = useQueryClient();
  const tier = useUserTier();
  const tierConfig = useTierConfig();
  const [rateLimited, setRateLimited] = useState(false);

  const { data: genStatus } = useQuery({
    queryKey: queryKeys.generation.status,
    queryFn: getGenerationStatus,
    enabled: tier === 'free',
    staleTime: 30_000,
  });

  const occasionLabel =
    OCCASIONS.find((o) => o.value === occasion)?.label || occasion;
  const regionLabels = regionPreferences.map(
    (r) => POPULAR_REGIONS.find((pr) => pr.value === r)?.label || r,
  );

  const isReadyToGenerate = Boolean(
    occasion && (
      mode === 'food_to_wine'
        ? foodPairing.trim()
        : wineInputValue.trim()
    ),
  );

  const handleGenerate = async () => {
    if (!occasion || !isReadyToGenerate) return;

    setIsGenerating(true);
    setGenerationError(null);
    setRateLimited(false);
    useTastingGenerationToastStore.getState().startGeneration('/tasting/generating');
    router.push('/tasting/generating');

    const payload: TastingPlanInput = mode === 'food_to_wine'
      ? {
          mode,
          occasion,
          foodPairing,
          regionPreferences,
          budgetMin,
          budgetMax,
          budgetCurrency: 'USD',
          wineCount,
          specialRequest: specialRequest.trim() || undefined,
        }
      : {
          mode,
          occasion,
          wineInput: {
            type: wineInputType,
            value: wineInputValue.trim(),
          },
          diet,
          prepTime,
          spiceLevel,
          dishBudgetMin,
          dishBudgetMax,
          cuisinePreferences,
          guestCountBand,
          specialRequest: specialRequest.trim() || undefined,
        };

    try {
      const plan = await generateTastingPlan(payload);

      trackEvent(mode === 'food_to_wine' ? 'plan_generated' : 'reverse_pairing_generated', {
        mode,
        occasion: plan.occasion,
        wineCount: plan.wineCount,
        usedSpecialRequest: Boolean(specialRequest.trim()),
      });

      setGeneratedPlan(plan);
      usePlanHistoryStore.getState().addPlan({
        id: plan.id,
        title: plan.title,
        occasion: plan.occasion,
        wineCount: plan.wineCount,
        createdAt: plan.createdAt,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.plans });
      queryClient.invalidateQueries({ queryKey: queryKeys.generation.status });
      const shouldAutoNavigate =
        typeof window !== 'undefined' && window.location.pathname === '/tasting/generating';
      resetWizard();
      if (shouldAutoNavigate) {
        useTastingGenerationToastStore.getState().finishGeneration(plan.id);
        router.push(`/tasting/${plan.id}`);
      } else {
        useTastingGenerationToastStore.getState().finishGeneration(plan.id);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : copy.toasts.generationErrorFallback;

      if (message.includes('Daily limit') || message.includes('daily limit')) {
        setRateLimited(true);
        useTastingGenerationToastStore.getState().clearGeneration();
      } else {
        useTastingGenerationToastStore.getState().failGeneration(message);
      }
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const summaryItems = mode === 'food_to_wine'
    ? [
        { label: 'Mode', value: copy.review.modeFoodToWine },
        { label: 'Occasion', value: occasionLabel },
        { label: 'Food', value: foodPairing || copy.review.notSpecified },
        {
          label: 'Regions',
          value: surpriseMe ? copy.review.surprise : regionLabels.join(', '),
        },
        { label: 'Budget', value: `$${budgetMin}-$${budgetMax} per bottle` },
        {
          label: 'Wines',
          value: `${wineCount} ${wineCount === 1 ? 'wine' : 'wines'}`,
        },
      ]
    : [
        { label: 'Mode', value: copy.review.modeWineToFood },
        { label: 'Occasion', value: occasionLabel },
        { label: 'Wine', value: wineInputValue || copy.review.notSpecified },
        { label: 'Diet', value: diet },
        { label: 'Prep', value: prepTime.replace('_', '-') },
        { label: 'Spice', value: spiceLevel },
        { label: 'Dish Budget', value: `$${dishBudgetMin}-$${dishBudgetMax} per dish` },
        {
          label: 'Cuisine',
          value: cuisinePreferences.length > 0 ? cuisinePreferences.join(', ') : copy.review.openCuisine,
        },
        { label: 'Guests', value: guestCountBand },
      ];

  return (
    <div>
      <h2 className="font-display text-heading-m text-primary mb-2xs">
        {copy.review.title}
      </h2>
      <p className="text-body-m text-text-secondary mb-m">
        {copy.review.subtitle}
      </p>

      <Card variant="outlined">
        <div className="flex flex-col gap-s">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex justify-between items-start gap-s">
              <span className="text-body-s text-text-muted">{item.label}</span>
              <span className="text-body-s font-medium text-text-primary text-right max-w-[60%]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-s">
        <label className="text-body-s text-text-secondary block mb-xs" htmlFor="special-request">
          {copy.review.optionalNoteLabel}
        </label>
        <textarea
          className={cn(
            'w-full rounded-xl border border-border bg-surface-elevated px-s py-xs text-body-s text-text-primary',
            'placeholder:text-text-muted focus:border-primary focus:outline-none',
            !tierConfig.allowSpecialRequests && 'opacity-70',
          )}
          disabled={!tierConfig.allowSpecialRequests}
          id="special-request"
          maxLength={300}
          placeholder={
            tierConfig.allowSpecialRequests
              ? copy.review.optionalNotePlaceholder
              : copy.review.optionalNoteLockedPlaceholder
          }
          rows={3}
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
        />
        <p className="text-body-xs text-text-muted mt-1">
          {tierConfig.allowSpecialRequests
            ? `${specialRequest.length}/300 characters`
            : copy.review.optionalNoteUpgradeHint}
        </p>
      </div>

      {!tierConfig.allowSpecialRequests && (
        <UpgradeCTA
          className="mt-1"
          message={copy.review.upgradeInlineMessage}
          variant="inline"
        />
      )}

      {tier === 'free' && genStatus && genStatus.dailyLimit !== null && (
        <p className="text-body-xs text-text-muted text-center mt-s">
          {genStatus.remaining} of {genStatus.dailyLimit} {copy.review.remainingTodaySuffix}
        </p>
      )}

      {rateLimited && (
        <UpgradeCTA
          message={copy.review.upgradeRateLimitMessage}
          variant="card"
        />
      )}

      {tier === 'anonymous' && (
        <UpgradeCTA
          message={copy.review.upgradeAnonymousMessage}
          variant="card"
        />
      )}

      <div className="flex gap-s mt-l">
        <Button
          className="flex-1"
          disabled={isGenerating}
          variant="ghost"
          onClick={prevStep}
        >
          {copy.review.backCta}
        </Button>
        <Button
          className="flex-1 gap-xs"
          disabled={isGenerating || rateLimited || !isReadyToGenerate}
          loading={isGenerating}
          onClick={handleGenerate}
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating
            ? copy.review.generateLoading
            : mode === 'food_to_wine'
              ? copy.review.generateFoodToWine
              : copy.review.generateWineToFood}
        </Button>
      </div>
    </div>
  );
}
