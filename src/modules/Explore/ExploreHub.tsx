'use client';

import {
  Eye,
  Flower2,
  MapPin,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { AuthDialog } from '@/common/components/AuthDialog';
import { cn } from '@/common/functions/cn';
import { trackEvent } from '@/common/services/analytics-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

const FEATURES = [
  {
    title: 'Guided Tasting',
    description: 'Walk through Look → Smell → Taste → Think with quick, sensory prompts.',
    href: '/explore/tasting-guide',
    icon: Eye,
    badge: 'Interactive',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    requiresAuth: true,
  },
  {
    title: 'Aroma Wheel',
    description: 'Discover aroma families with a tap-first wheel made for fast recognition.',
    href: '/explore/aroma-wheel',
    icon: Flower2,
    badge: 'Interactive',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    requiresAuth: true,
  },
  {
    title: 'Serving Guide',
    description: 'Simple serving cues for temperature, glassware, and when to decant.',
    href: '/explore/serving-guide',
    icon: Thermometer,
    badge: 'Reference',
    badgeColor: 'bg-accent/10 text-accent border-accent/20',
    requiresAuth: false,
  },
  {
    title: 'Corkage Directory',
    description: 'Find local BYOB spots and corkage rules for easier night planning.',
    href: '/corkage',
    icon: MapPin,
    badge: 'Toronto',
    badgeColor: 'bg-wine-burgundy/10 text-wine-burgundy border-wine-burgundy/20',
    requiresAuth: false,
  },
] as const;

export function ExploreHub() {
  const { isAuthenticated } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="max-w-md mx-auto px-s py-m">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-heading-l text-primary mb-2xs">
          Vineyard Walk
        </h1>
        <p className="text-body-m text-text-secondary mb-l">
          Explore wine with playful guides designed to build confidence, not
          overwhelm you.
        </p>
      </motion.div>

      {/* Tasting Plan CTA */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        <Link href="/tasting/new">
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl p-m mb-s',
              'bg-gradient-to-br from-primary/15 via-primary/10 to-accent/10',
              'border border-primary/20',
              'transition-all active:scale-[0.98] hover:shadow-md hover:border-primary/40',
            )}
            onClick={() => trackEvent('plan_wizard_started', { source: 'explore' })}
          >
            <div className="flex items-center gap-m">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-heading-xs text-primary mb-0.5">
                  Start a New Tasting Story
                </h2>
                <p className="text-body-s text-text-secondary">
                  We turn your moment and menu into a guided lineup worth
                  sharing.
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      <div className="flex flex-col gap-s">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          const needsAuth = feature.requiresAuth && !isAuthenticated();

          const card = (
            <motion.div
              key={feature.title}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            >
              <div
                className={cn(
                  'flex gap-m p-m rounded-2xl border border-border bg-surface-elevated',
                  'transition-all active:scale-[0.98]',
                  'hover:border-primary/30 hover:shadow-md',
                )}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-xs mb-1">
                    <h2 className="font-display text-heading-xs text-text-primary">
                      {feature.title}
                    </h2>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-xs py-0.5 text-body-xs font-medium border',
                        feature.badgeColor,
                      )}
                    >
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-body-s text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );

          if (needsAuth) {
            return (
              <button
                key={feature.title}
                className="text-left"
                onClick={() => {
                  trackEvent('upgrade_cta_clicked', {
                    source: 'explore_feature_gate',
                    feature: feature.title,
                  });
                  setAuthOpen(true);
                }}
              >
                {card}
              </button>
            );
          }

          return (
            <Link
              key={feature.title}
              href={feature.href}
              onClick={() => {
                if (feature.title === 'Corkage Directory') {
                  trackEvent('corkage_page_viewed', { source: 'explore_feature_card' });
                }
              }}
            >
              {card}
            </Link>
          );
        })}
      </div>

      <AuthDialog
        defaultMode="signup"
        open={authOpen}
        onOpenChange={setAuthOpen}
      />
    </div>
  );
}
