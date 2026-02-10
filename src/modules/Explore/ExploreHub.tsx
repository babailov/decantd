'use client';

import {
  Eye,
  Flower2,
  MapPin,
  Thermometer,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { AuthDialog } from '@/common/components/AuthDialog';
import { cn } from '@/common/functions/cn';
import { useAuthStore } from '@/common/stores/useAuthStore';

const FEATURES = [
  {
    title: 'Guided Tasting',
    description: 'Learn the Look → Smell → Taste → Think method used by sommeliers worldwide.',
    href: '/explore/tasting-guide',
    icon: Eye,
    badge: 'Interactive',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    requiresAuth: true,
  },
  {
    title: 'Aroma Wheel',
    description: 'Explore 70+ wine aromas across 6 categories. Identify what you smell.',
    href: '/explore/aroma-wheel',
    icon: Flower2,
    badge: 'Interactive',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    requiresAuth: true,
  },
  {
    title: 'Serving Guide',
    description: 'Temperatures, glassware, and decanting — serve every wine at its best.',
    href: '/explore/serving-guide',
    icon: Thermometer,
    badge: 'Reference',
    badgeColor: 'bg-accent/10 text-accent border-accent/20',
    requiresAuth: false,
  },
  {
    title: 'Corkage Directory',
    description: 'Find BYOB-friendly restaurants in Toronto with corkage policies.',
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
          Explore
        </h1>
        <p className="text-body-m text-text-secondary mb-l">
          Develop your palate with interactive guides and wine education.
        </p>
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
                onClick={() => setAuthOpen(true)}
              >
                {card}
              </button>
            );
          }

          return (
            <Link key={feature.title} href={feature.href}>
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
