'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Lightbulb,
  MapPin,
  Sparkles,
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
import { trackEvent } from '@/common/services/analytics-api';
import { useAuthStore } from '@/common/stores/useAuthStore';
import { TastingPlan } from '@/common/types/tasting';

import { SharePlan } from './SharePlan';
import { WineRecommendation } from './WineRecommendation';

interface TastingPlanViewProps {
  plan: TastingPlan;
}

interface RatingData {
  planWineId: string;
  rating: number;
  tastingNotes: string | null;
}

export function TastingPlanView({ plan }: TastingPlanViewProps) {
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const { data: ratingsData } = useQuery({
    queryKey: queryKeys.user.ratingsForPlan(plan.id),
    queryFn: async (): Promise<{ ratings: RatingData[] }> => {
      const res = await fetch(`/api/ratings/plan/${plan.id}`);
      if (!res.ok) return { ratings: [] };
      return res.json();
    },
    enabled: isAuthenticated(),
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
                {plan.wineCount} {plan.wineCount === 1 ? 'wine' : 'wines'}
              </Badge>
            </div>
          </div>
          <SharePlan planId={plan.id} />
        </div>
      </motion.div>

      {/* Overview card */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="mb-m" variant="outlined">
          <div className="flex items-start gap-xs mb-xs">
            <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-body-m text-text-secondary">{plan.description}</p>
          </div>
          <div className="flex items-center gap-xs text-body-s">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-text-secondary">
              Estimated total: ${plan.totalEstimatedCostMin}–$
              {plan.totalEstimatedCostMax}
            </span>
          </div>
          {plan.foodPairing && (
            <div className="flex items-center gap-xs text-body-s mt-1">
              <Wine className="w-4 h-4 text-primary" />
              <span className="text-text-secondary">
                Pairing with: {plan.foodPairing}
              </span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Tasting tips */}
      {plan.tastingTips && plan.tastingTips.length > 0 && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-m"
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setTipsExpanded(!tipsExpanded)}
          >
            <div className="flex items-center gap-xs">
              <Lightbulb className="w-5 h-5 text-accent" />
              <span className="font-display text-body-l font-semibold text-text-primary">
                Tasting Tips
              </span>
            </div>
            {tipsExpanded ? (
              <ChevronUp className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            )}
          </button>
          {tipsExpanded && (
            <motion.ul
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-xs space-y-xs pl-8"
              initial={{ opacity: 0, height: 0 }}
            >
              {plan.tastingTips.map((tip, i) => (
                <li
                  key={i}
                  className="text-body-s text-text-secondary list-disc"
                >
                  {tip}
                </li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      )}

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
                Bring your wines to dinner?
              </p>
              <p className="text-body-xs text-text-secondary">
                Find corkage-friendly restaurants nearby
              </p>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Wine timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-border" />

        <div className="space-y-m">
          {plan.wines.map((wine, i) => (
            <div key={wine.id} className="relative pl-12">
              {/* Timeline dot */}
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
              Save this plan to your collection
            </p>
            <p className="text-body-s text-text-secondary mb-s">
              Create an account to track your tastings, rate wines, and build your palate profile.
            </p>
            <Button
              size="md"
              variant="secondary"
              onClick={() => setAuthOpen(true)}
            >
              Create Free Account
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
            Create Another Plan
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
