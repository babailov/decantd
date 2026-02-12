'use client';

import { ChevronRight, Sparkles, Wine } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/common/components/Button';
import { trackEvent } from '@/common/services/analytics-api';

export function LandingHero() {
  return (
    <div className="vineyard-bg flex flex-col items-center min-h-screen px-s pt-xl pb-l">
      {/* Hero */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-md mx-auto rounded-[2rem] border border-border-strong/40 bg-surface-elevated px-m py-l shadow-[0_22px_42px_-28px_rgba(123,45,58,0.3)]"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="inline-flex items-center rounded-full bg-accent/20 text-primary px-s py-1 text-body-xs font-semibold mb-s">
          Decantd Daily Pour
        </span>
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/12 mb-m shadow-inner border border-primary/20">
          <Wine className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-heading-xl text-primary mb-xs tracking-tight">
          Walk Through Your Next Tasting
        </h1>
        <p className="text-body-l text-text-secondary mb-l max-w-sm">
          A guided, story-like tasting path through mood, bites, and bottles
          that feel like your vibe tonight.
        </p>

        <Link href="/tasting/new">
          <Button
            className="gap-xs"
            size="lg"
            onClick={() => {
              trackEvent('landing_cta_clicked');
              trackEvent('plan_wizard_started', { source: 'landing' });
            }}
          >
            <Sparkles className="w-5 h-5" />
            Start the Journey
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>

      {/* How it works */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto mt-xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      >
        <h2 className="font-display text-heading-s text-primary text-center mb-m">
          Your Three Stops
        </h2>

        <div className="flex flex-col gap-m">
          {[
            {
              step: '1',
              title: 'Set the scene',
              description:
                'Tell us your occasion, table mood, and what is on the plate.',
            },
            {
              step: '2',
              title: 'Meet your lineup',
              description:
                'Your sommelier guide suggests an order with simple notes and pairing cues.',
            },
            {
              step: '3',
              title: 'Pour and explore',
              description:
                'Save and share your tasting path for dinner, date night, or a hosted flight.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-s items-start rounded-2xl border border-border/70 bg-surface-elevated p-s shadow-[0_12px_24px_-20px_rgba(45,41,38,0.12)]"
            >
              <div className="grid place-items-center text-center w-10 h-10 rounded-full bg-primary text-text-on-primary font-display text-body-l leading-none font-bold shrink-0 shadow-sm">
                {item.step}
              </div>
              <div>
                <h3 className="font-display text-body-l font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="text-body-s text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
