'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { UpgradeCTA } from '@/common/components/UpgradeCTA';
import { queryKeys } from '@/common/constants/queryKeys';
import { OCCASIONS, POPULAR_REGIONS } from '@/common/constants/wine.const';
import { cn } from '@/common/functions/cn';
import { useTierConfig, useUserTier } from '@/common/hooks/useTierConfig';
import { trackEvent } from '@/common/services/analytics-api';
import { generateTastingPlan, getGenerationStatus } from '@/common/services/tasting-api';
import { usePlanHistoryStore } from '@/common/stores/usePlanHistoryStore';
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
    specialRequest,
    setSpecialRequest,
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

  // Fetch generation status for free users
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

  const handleGenerate = async () => {
    if (!occasion) return;

    setIsGenerating(true);
    setGenerationError(null);
    setRateLimited(false);

    try {
      const plan = await generateTastingPlan({
        occasion,
        foodPairing,
        regionPreferences,
        budgetMin,
        budgetMax,
        budgetCurrency: 'USD',
        wineCount,
        specialRequest: specialRequest.trim() || undefined,
      });

      trackEvent('plan_generated', {
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
      resetWizard();
      router.push(`/tasting/${plan.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';

      // Check for rate limit error
      if (message.includes('Daily limit') || message.includes('daily limit')) {
        setRateLimited(true);
      } else {
        toast.error(message);
      }

      setGenerationError(message);
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

      <div className="mt-s">
        <label className="text-body-s text-text-secondary block mb-xs" htmlFor="special-request">
          Advanced AI refinement request
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
              ? 'e.g., prioritize low-intervention wines, include one Ontario option, and keep tannins softer.'
              : 'Paid feature: add custom sommelier instructions.'
          }
          rows={3}
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
        />
        <p className="text-body-xs text-text-muted mt-1">
          {tierConfig.allowSpecialRequests
            ? `${specialRequest.length}/300 characters`
            : 'Upgrade to use custom AI instructions.'}
        </p>
      </div>

      {!tierConfig.allowSpecialRequests && (
        <UpgradeCTA
          className="mt-1"
          message="Unlock custom sommelier requests and advanced AI refinements."
          variant="inline"
        />
      )}

      {/* Generation status for free users */}
      {tier === 'free' && genStatus && genStatus.dailyLimit !== null && (
        <p className="text-body-xs text-text-muted text-center mt-s">
          {genStatus.remaining} of {genStatus.dailyLimit} tastings remaining today
        </p>
      )}

      {/* Rate limit reached */}
      {rateLimited && (
        <UpgradeCTA
          message="You've used all your tastings for today. Upgrade for unlimited plans, or try again tomorrow."
          variant="card"
        />
      )}

      {/* Anonymous CTA */}
      {tier === 'anonymous' && (
        <UpgradeCTA
          message="Sign up for personalized plans with custom options and 10 daily tastings."
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
          Back
        </Button>
        <Button
          className="flex-1 gap-xs"
          disabled={isGenerating || rateLimited}
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
