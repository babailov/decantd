'use client';

import { Wine } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/common/components/Button';
import { useTastingPlan } from '@/common/hooks/services/useTastingPlan';
import { useTastingGenerationToastStore } from '@/common/stores/useTastingGenerationToastStore';
import { useTastingStore } from '@/common/stores/useTastingStore';

import { TastingPlanView } from '@/modules/TastingPlan/TastingPlanView';

interface TastingPlanPageClientProps {
  id: string;
}

export function TastingPlanPageClient({ id }: TastingPlanPageClientProps) {
  const searchParams = useSearchParams();
  const generatedPlan = useTastingStore((s) => s.generatedPlan);
  const clearGeneration = useTastingGenerationToastStore((s) => s.clearGeneration);
  const showBackToJournal = searchParams.get('from') === 'journal';

  useEffect(() => {
    clearGeneration();
  }, [clearGeneration]);

  // If we just generated the plan, use the store data (no fetch needed)
  const hasCachedPlan = generatedPlan?.id === id;

  const { data: fetchedPlan, isLoading, error } = useTastingPlan(id);

  const plan = hasCachedPlan ? generatedPlan : fetchedPlan;

  if (isLoading && !hasCachedPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-xs">
          <Wine className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-body-l text-text-secondary">
            Loading your tasting plan...
          </span>
        </div>
      </div>
    );
  }

  if (error && !hasCachedPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-s text-center">
        <Wine className="h-12 w-12 text-text-muted mb-s" />
        <h2 className="font-display text-heading-s text-primary mb-xs">
          Plan Not Found
        </h2>
        <p className="text-body-m text-text-secondary mb-m">
          This tasting plan may have been removed or the link is incorrect.
        </p>
        <Link href="/tasting/new">
          <Button>Create a New Plan</Button>
        </Link>
      </div>
    );
  }

  if (!plan) return null;

  return <TastingPlanView plan={plan} showBackToJournal={showBackToJournal} />;
}
