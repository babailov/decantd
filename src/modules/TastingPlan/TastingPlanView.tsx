'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Lightbulb,
  MapPin,
  Sparkles,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { AuthDialog } from '@/common/components/AuthDialog';
import { Badge } from '@/common/components/Badge';
import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { WineRating } from '@/common/components/WineRating';
import { queryKeys } from '@/common/constants/queryKeys';
import { OCCASIONS } from '@/common/constants/wine.const';
import { copy } from '@/common/content';
import { trackEvent } from '@/common/services/analytics-api';
import { useAuthStore } from '@/common/stores/useAuthStore';
import { TastingPlan } from '@/common/types/tasting';

import { ShareDrawer } from './ShareDrawer';
import { WineRecommendation } from './WineRecommendation';

interface TastingPlanViewProps {
  plan: TastingPlan;
  showBackToJournal?: boolean;
}

interface RatingData {
  planWineId: string;
  rating: number;
  tastingNotes: string | null;
}

export function TastingPlanView({ plan, showBackToJournal = false }: TastingPlanViewProps) {
  const [deepDiveExpanded, setDeepDiveExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const isWineToFood = plan.mode === 'wine_to_food';

  const { data: ratingsData } = useQuery({
    queryKey: queryKeys.user.ratingsForPlan(plan.id),
    queryFn: async (): Promise<{ ratings: RatingData[] }> => {
      const res = await fetch(`/api/ratings/plan/${plan.id}`);
      if (!res.ok) return { ratings: [] };
      return res.json();
    },
    enabled: isAuthenticated() && !isWineToFood,
  });

  const ratingsMap = new Map(
    (ratingsData?.ratings || []).map((r) => [r.planWineId, r]),
  );

  const occasionLabel =
    OCCASIONS.find((o) => o.value === plan.occasion)?.label || plan.occasion;
  const occasionEmoji =
    OCCASIONS.find((o) => o.value === plan.occasion)?.emoji || '';

  return (
    <div className="max-w-md mx-auto px-s py-m">
      {showBackToJournal && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-m"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-xs bg-surface-elevated/70" variant="outlined">
            <Link href="/journal">
              <Button className="w-full justify-start gap-xs" variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                {copy.plan.backToJournal}
              </Button>
            </Link>
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-m"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between mb-xs">
          <div>
            <h1 className="font-display text-heading-m text-primary">
              {plan.title}
            </h1>
            <div className="flex items-center gap-xs mt-1">
              <Badge>{occasionEmoji} {occasionLabel}</Badge>
              <Badge variant="default">
                {isWineToFood
                  ? `${plan.pairings.length} ${copy.plan.pairingsCountLabel}`
                  : `${plan.wineCount} ${plan.wineCount === 1 ? copy.plan.winesSingular : copy.plan.winesPlural}`}
              </Badge>
            </div>
          </div>
          <ShareDrawer plan={plan} />
        </div>
      </motion.div>

      {/* Story card */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="mb-m bg-surface-elevated border-border" variant="outlined">
          <div className="flex items-start gap-xs mb-xs">
            <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-body-m text-text-secondary">{plan.description}</p>
          </div>
          <p className="text-body-s text-text-muted">
            {isWineToFood
              ? copy.plan.summaryWineToFood
              : copy.plan.summaryFoodToWine}
          </p>
        </Card>
      </motion.div>

      {/* Bring Your Wines CTA */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-m"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Link href="/corkage">
          <Card
            className="flex items-center gap-s hover:bg-surface transition-colors cursor-pointer"
            variant="outlined"
            onClick={() => trackEvent('corkage_page_viewed', { source: 'tasting_plan_cta' })}
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-display text-body-m font-semibold text-primary">
                {copy.plan.corkageTitle}
              </p>
              <p className="text-body-xs text-text-secondary">
                {copy.plan.corkageDescription}
              </p>
            </div>
          </Card>
        </Link>
      </motion.div>

      {isWineToFood ? (
        <div className="space-y-s">
          {plan.pairings.map((pairing, index) => (
            <Card key={`${pairing.dishName}-${index}`} className="bg-surface-elevated border-border" variant="outlined">
              <div className="flex items-start justify-between gap-s">
                <div>
                  <p className="font-display text-body-l font-semibold text-primary">
                    {index + 1}. {pairing.dishName}
                  </p>
                  <p className="text-body-xs text-text-muted mt-0.5">
                    {pairing.cuisineType || copy.plan.flexibleCuisine}
                    {pairing.prepTimeBand ? ` · ${pairing.prepTimeBand}` : ''}
                    {pairing.estimatedCostMin && pairing.estimatedCostMax
                      ? ` · $${pairing.estimatedCostMin}-$${pairing.estimatedCostMax}`
                      : ''}
                  </p>
                </div>
                <UtensilsCrossed className="h-5 w-5 text-accent shrink-0" />
              </div>
              <p className="text-body-s text-text-secondary mt-xs">{pairing.rationale}</p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-border" />

          <div className="space-y-m">
            {plan.wines.map((wine, i) => (
              <div key={wine.id} className="relative pl-12">
                <div className="absolute left-[7px] top-4 w-6 h-6 rounded-full bg-primary text-text-on-primary flex items-center justify-center text-body-xs font-bold z-elevated">
                  {wine.tastingOrder}
                </div>
                <WineRecommendation index={i} wine={wine}>
                  <WineRating
                    existingRating={ratingsMap.get(wine.id)}
                    planId={plan.id}
                    planWineId={wine.id}
                  />
                </WineRecommendation>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sommelier deep dive */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-m"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <button
          className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-surface-elevated px-s py-xs text-left"
          onClick={() => setDeepDiveExpanded(!deepDiveExpanded)}
        >
          <div className="flex items-center gap-xs">
            <Lightbulb className="h-5 w-5 text-accent" />
            <span className="font-display text-body-m font-semibold text-text-primary">
              {copy.plan.deepDiveTitle}
            </span>
          </div>
          {deepDiveExpanded ? (
            <ChevronUp className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          )}
        </button>

        {deepDiveExpanded && (
          <motion.div
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-s space-y-s rounded-xl border border-border/70 bg-surface p-s"
            initial={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-xs text-body-s">
              <DollarSign className="h-4 w-4 text-accent" />
              <span className="text-text-secondary">
                {copy.plan.estimatedTotalPrefix}: ${plan.totalEstimatedCostMin}–$
                {plan.totalEstimatedCostMax}
              </span>
            </div>

            {plan.foodPairing && (
              <div className="flex items-center gap-xs text-body-s">
                <Wine className="h-4 w-4 text-primary" />
                <span className="text-text-secondary">
                  {isWineToFood
                    ? `${copy.plan.selectedWinePrefix}: ${plan.foodPairing}`
                    : `${copy.plan.pairingDirectionPrefix}: ${plan.foodPairing}`}
                </span>
              </div>
            )}

            {isWineToFood && plan.hostTips.length > 0 && (
              <ul className="space-y-xs pl-5">
                {plan.hostTips.map((tip, i) => (
                  <li key={i} className="list-disc text-body-s text-text-secondary">
                    {tip}
                  </li>
                ))}
              </ul>
            )}

            {!isWineToFood && plan.tastingTips && plan.tastingTips.length > 0 && (
              <ul className="space-y-xs pl-5">
                {plan.tastingTips.map((tip, i) => (
                  <li key={i} className="list-disc text-body-s text-text-secondary">
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Auth prompt (show for unauthenticated users) */}
      {!isAuthenticated() && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-m"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <Card className="text-center" variant="elevated">
            <Bookmark className="h-6 w-6 text-accent mx-auto mb-xs" />
            <p className="font-display text-body-l font-semibold text-primary mb-1">
              {copy.plan.saveTitle}
            </p>
            <p className="text-body-s text-text-secondary mb-s">
              {copy.plan.saveDescription}
            </p>
            <Button
              size="md"
              variant="secondary"
              onClick={() => setAuthOpen(true)}
            >
              {copy.plan.saveCta}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Bottom CTA */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-xl text-center"
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Link href="/tasting/new">
          <Button className="gap-xs" size="lg" variant="primary">
            <Sparkles className="w-5 h-5" />
            {copy.plan.createAnotherCta}
          </Button>
        </Link>
      </motion.div>

      <AuthDialog
        defaultMode="signup"
        open={authOpen}
        onOpenChange={setAuthOpen}
      />
    </div>
  );
}
