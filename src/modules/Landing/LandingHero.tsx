'use client';

import { ChevronRight, Sparkles, Wine } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/common/components/Button';
import { trackEvent } from '@/common/services/analytics-api';

export function LandingHero() {
  return (
    <div className="flex flex-col items-center min-h-screen px-s pt-xl pb-l gap-xl">
      <section
        className="story-theme w-full max-w-md mx-auto rounded-3xl p-m border border-border"
        data-theme="cellar"
      >
        <div className="bg-story-cellar" />
        {/* Hero */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center rounded-[1.35rem] border border-border bg-surface/85 backdrop-blur-xs px-m py-l shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.68, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/15 mb-m shadow-inner border border-border">
            <Wine className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-display text-heading-xl text-primary mb-xs">
            Walk Through Your Next Tasting
          </h1>
          <p className="text-body-l text-text-secondary mb-l max-w-sm">
            A guided, story-like journey through food, mood, and wines you will
            actually want to open.
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
      </section>

      <section
        className="story-theme w-full max-w-md mx-auto rounded-3xl p-m border border-border"
        data-theme="vineyard"
      >
        <div className="bg-story-vineyard" />
        {/* How it works */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.54, delay: 0.25, ease: 'easeOut' }}
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
                className="flex gap-s items-start rounded-2xl border border-border bg-surface/92 p-s shadow-sm"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-text-on-primary font-display text-body-l font-bold shrink-0">
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
      </section>
    </div>
  );
}
