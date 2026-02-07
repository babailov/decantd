'use client';

import { ChevronRight, Sparkles, Wine } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

import { Button } from '@/common/components/Button';

export function LandingHero() {
  return (
    <div className="flex flex-col items-center min-h-screen px-s pt-xl pb-l">
      {/* Hero */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-m">
          <Wine className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-heading-xl text-primary mb-xs">
          Plan the Perfect Wine Tasting
        </h1>
        <p className="text-body-l text-text-secondary mb-l max-w-sm">
          AI-powered tasting plans with food pairings, flavor profiles, and
          expert recommendations — in seconds.
        </p>

        <Link href="/tasting/new">
          <Button className="gap-xs" size="lg">
            <Sparkles className="w-5 h-5" />
            Create Your Tasting Plan
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
          How It Works
        </h2>

        <div className="flex flex-col gap-m">
          {[
            {
              step: '1',
              title: 'Tell us about your tasting',
              description:
                'Occasion, food, preferences, and budget — just a few quick taps.',
            },
            {
              step: '2',
              title: 'AI crafts your plan',
              description:
                'Our sommelier AI selects the perfect wines with tasting order and notes.',
            },
            {
              step: '3',
              title: 'Share & enjoy',
              description:
                'Get a shareable link with flavor profiles, pairing tips, and more.',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-s items-start">
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
    </div>
  );
}
